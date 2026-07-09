package syncX.modules.questiongenerator.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.cjobpost.entity.Cjobpost;
import syncX.modules.cjobpost.entity.JobRequirement;
import syncX.modules.questiongenerator.repository.DocumentChunkRepository;
import syncX.modules.questiongenerator.exception.QuestionGeneratorException;

import java.util.*;

@Service
public class RetrievalService {

    private static final Logger logger = LoggerFactory.getLogger(RetrievalService.class);

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private DocumentChunkRepository documentChunkRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${rag.similarity-threshold:0.3}")
    private double similarityThreshold;

    /**
     * Self-healing DB check. Verifies and adds any missing columns on startup.
     */
    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY");
            jdbcTemplate.execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS chunk_type VARCHAR(50)");
            
            // Safe database migration to UUID type for company_id
            try {
                jdbcTemplate.execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS company_id UUID");
            } catch (Exception e) {
                logger.info("[RAG] company_id column might already exist. Attempting to alter type to UUID.");
            }
            try {
                jdbcTemplate.execute("ALTER TABLE document_chunks ALTER COLUMN company_id TYPE UUID USING company_id::text::uuid");
            } catch (Exception e) {
                logger.warn("[RAG] Could not alter company_id column type to UUID: {}", e.getMessage());
            }

            jdbcTemplate.execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50)");
            logger.info("[RAG] Verified and updated document_chunks table schema successfully.");
        } catch (Exception e) {
            logger.error("[RAG] Failed to verify or update document_chunks schema", e);
        }
    }

    /**
     * Helper to check chunk count in repository.
     */
    public int countChunksForJob(Long jobId) {
        if (jobId == null) {
            return 0;
        }
        return documentChunkRepository.countByJobId(jobId);
    }

    /**
     * Chunk and generate embeddings for a job post, then store them in the document_chunks table.
     */
    @Transactional
    public void generateAndStoreEmbeddingsForJob(Long jobId) {
        if (jobId == null) {
            return;
        }

        logger.info("[RAG Embedding Generation] Started generating embeddings for job ID: {}", jobId);

        // 1. Fetch job row from jobs table
        Map<String, Object> jobRow;
        try {
            jobRow = jdbcTemplate.queryForMap(
                    "SELECT job_title, description, key_requirements, company_id, experience_level, employment_type FROM jobs WHERE id = ?",
                    jobId
            );
        } catch (Exception e) {
            logger.error("[RAG Exception] Failed to fetch job row from database for ID: {}", jobId, e);
            throw new QuestionGeneratorException("Job not found in database: " + jobId, e);
        }

        String jobTitle = (String) jobRow.get("job_title");
        String description = (String) jobRow.get("description");
        String keyRequirements = (String) jobRow.get("key_requirements");
        UUID companyId = null;
        Object rawCompanyId = jobRow.get("company_id");
        if (rawCompanyId instanceof UUID) {
            companyId = (UUID) rawCompanyId;
        } else if (rawCompanyId instanceof String) {
            companyId = UUID.fromString((String) rawCompanyId);
        }
        String expLevel = (String) jobRow.get("experience_level");
        String empType = (String) jobRow.get("employment_type");

        // 2. Delete existing chunks for this job
        try {
            documentChunkRepository.deleteByJobId(jobId);
        } catch (Exception e) {
            logger.error("[RAG Exception] Failed to delete existing chunks for job ID: {}", jobId, e);
            throw new QuestionGeneratorException("Failed to delete old document chunks", e);
        }

        // 3. Prepare chunks (DESCRIPTION and REQUIREMENT type chunks)
        List<ChunkData> chunks = new ArrayList<>();

        // Job Description Chunk
        if (description != null && !description.isBlank()) {
            chunks.add(new ChunkData(description.trim(), "DESCRIPTION"));
        }

        // Job Requirements Chunks (each requirement line as an individual semantic chunk)
        if (keyRequirements != null && !keyRequirements.isBlank()) {
            String[] lines = keyRequirements.split("\n");
            for (String line : lines) {
                if (line == null) continue;
                // Remove list/bullet characters (e.g. -, *, •, 1., etc.) at start of line
                String cleanReq = line.replaceFirst("^\\s*[\\-\\*•\\d\\.\\)]+\\s*", "").trim();
                if (!cleanReq.isBlank()) {
                    chunks.add(new ChunkData(cleanReq, "REQUIREMENT"));
                }
            }
        }

        // If no requirements or description chunks were found but we have a title, add title as description
        if (chunks.isEmpty() && jobTitle != null && !jobTitle.isBlank()) {
            chunks.add(new ChunkData(jobTitle.trim(), "DESCRIPTION"));
        }

        // 4. Generate embeddings and save to DB
        int savedCount = 0;
        for (ChunkData chunk : chunks) {
            try {
                List<Double> embedding = embeddingService.getEmbedding(chunk.content);
                String embeddingString = embedding.toString(); // format as "[0.123, -0.456, ...]"

                documentChunkRepository.insertChunk(
                        jobId,
                        chunk.content,
                        embeddingString,
                        chunk.type,
                        companyId,
                        expLevel,
                        empType
                );
                savedCount++;
            } catch (Exception e) {
                logger.error("[RAG Exception] Failed to save chunk embedding of type {} for job ID: {}", chunk.type, jobId, e);
            }
        }
        logger.info("[RAG Embedding Generation] Successfully stored {} of {} generated chunks for job ID: {}", savedCount, chunks.size(), jobId);
    }

    /**
     * Hybrid Search: Combines vector similarity search & PostgreSQL Full Text Search (FTS).
     * Pre-filters by metadata (company_id, experience_level, employment_type, and chunk_type).
     * Filters out matches below the similarity threshold and ranks by vector similarity.
     */
    public List<String> retrieveRelevantChunks(String searchTerms, Long jobId, int limit, List<String> allowedChunkTypes) {
        if (jobId == null || searchTerms == null || searchTerms.isBlank()) {
            return Collections.emptyList();
        }

        long startTime = System.nanoTime();
        logger.info("[RAG Retrieval] Initiating hybrid search retrieval for jobId: {}, query: '{}'", jobId, searchTerms);

        try {
            // 1. Get embedding (uses cached query embedding if available)
            List<Double> queryEmbedding = embeddingService.getEmbedding(searchTerms);
            String embeddingString = queryEmbedding.toString();

            // 2. Fetch job metadata for pre-filtering (Avoids duplicate DB queries by fetching once)
            Map<String, Object> jobMeta;
            try {
                jobMeta = jdbcTemplate.queryForMap(
                        "SELECT company_id, experience_level, employment_type FROM jobs WHERE id = ?", jobId
                );
            } catch (Exception e) {
                logger.warn("[RAG] Failed to fetch job metadata for pre-filtering on jobId {}, skipping metadata filters", jobId, e);
                jobMeta = Collections.emptyMap();
            }
            UUID companyId = null;
            Object rawCompanyId = jobMeta.get("company_id");
            if (rawCompanyId instanceof UUID) {
                companyId = (UUID) rawCompanyId;
            } else if (rawCompanyId instanceof String) {
                companyId = UUID.fromString((String) rawCompanyId);
            }
            String expLevel = (String) jobMeta.get("experience_level");
            String empType = (String) jobMeta.get("employment_type");

            // 3. Execute Vector Search and Full Text Search (FTS)
            List<Object[]> vectorResults;
            List<Object[]> ftsResults;

            if (allowedChunkTypes != null && !allowedChunkTypes.isEmpty()) {
                vectorResults = documentChunkRepository.vectorSearchWithTypes(
                        embeddingString, jobId, companyId, expLevel, empType, allowedChunkTypes, limit
                );
                ftsResults = documentChunkRepository.ftsSearchWithTypes(
                        embeddingString, jobId, companyId, expLevel, empType, allowedChunkTypes, searchTerms
                );
            } else {
                vectorResults = documentChunkRepository.vectorSearchWithoutTypes(
                        embeddingString, jobId, companyId, expLevel, empType, limit
                );
                ftsResults = documentChunkRepository.ftsSearchWithoutTypes(
                        embeddingString, jobId, companyId, expLevel, empType, searchTerms
                );
            }

            // 4. Merge results and remove duplicate content
            Map<String, Double> mergedMap = new LinkedHashMap<>();

            // Process vector matches
            for (Object[] row : vectorResults) {
                String content = (String) row[0];
                double similarity = ((Number) row[1]).doubleValue();
                mergedMap.put(content, similarity);
            }

            // Process FTS matches (will override or add results)
            for (Object[] row : ftsResults) {
                String content = (String) row[0];
                double similarity = ((Number) row[1]).doubleValue();
                mergedMap.put(content, similarity);
            }

            // 5. Filter by configured similarity threshold & sort DESC
            List<Map.Entry<String, Double>> sortedCandidates = new ArrayList<>();
            for (Map.Entry<String, Double> entry : mergedMap.entrySet()) {
                if (entry.getValue() >= similarityThreshold) {
                    sortedCandidates.add(entry);
                } else {
                    logger.debug("[RAG Retrieval] Ignored chunk below threshold ({} < {}): {}", entry.getValue(), similarityThreshold, entry.getKey());
                }
            }

            sortedCandidates.sort((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()));

            // 6. Return top K
            List<String> finalChunks = new ArrayList<>();
            for (int i = 0; i < Math.min(limit, sortedCandidates.size()); i++) {
                finalChunks.add(sortedCandidates.get(i).getKey());
            }

            long durationMs = (System.nanoTime() - startTime) / 1000000;
            logger.info("[RAG Retrieval] Hybrid search completed in {} ms | found {} chunks above threshold ({} configured)", 
                    durationMs, finalChunks.size(), similarityThreshold);

            return finalChunks;

        } catch (Exception e) {
            long durationMs = (System.nanoTime() - startTime) / 1000000;
            logger.error("[RAG Exception] Hybrid retrieval failed after {} ms for query '{}' on jobId {}", durationMs, searchTerms, jobId, e);
            throw new QuestionGeneratorException("RAG Hybrid retrieval failed", e);
        }
    }

    private static class ChunkData {
        String content;
        String type;

        ChunkData(String content, String type) {
            this.content = content;
            this.type = type;
        }
    }
}
