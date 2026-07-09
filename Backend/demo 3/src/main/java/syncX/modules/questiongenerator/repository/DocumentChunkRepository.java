package syncX.modules.questiongenerator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.questiongenerator.entity.DocumentChunk;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM document_chunks WHERE job_id = :jobId", nativeQuery = true)
    void deleteByJobId(@Param("jobId") Long jobId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO document_chunks (job_id, chunk_content, embedding, chunk_type, company_id, experience_level, employment_type) " +
            "VALUES (:jobId, :content, :embedding::vector, :chunkType, :companyId, :experienceLevel, :employmentType)", nativeQuery = true)
    void insertChunk(
            @Param("jobId") Long jobId,
            @Param("content") String content,
            @Param("embedding") String embedding,
            @Param("chunkType") String chunkType,
            @Param("companyId") Long companyId,
            @Param("experienceLevel") String experienceLevel,
            @Param("employmentType") String employmentType
    );

    @Query(value = "SELECT COUNT(*) FROM document_chunks WHERE job_id = :jobId", nativeQuery = true)
    int countByJobId(@Param("jobId") Long jobId);

    @Query(value = "SELECT chunk_content, (1 - (embedding <=> :queryEmbedding::vector)) AS similarity " +
            "FROM document_chunks " +
            "WHERE job_id = :jobId " +
            "AND (:companyId IS NULL OR company_id = :companyId) " +
            "AND (:expLevel IS NULL OR experience_level = :expLevel) " +
            "AND (:empType IS NULL OR employment_type = :empType) " +
            "ORDER BY similarity DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<Object[]> vectorSearchWithoutTypes(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("jobId") Long jobId,
            @Param("companyId") Long companyId,
            @Param("expLevel") String expLevel,
            @Param("empType") String empType,
            @Param("limit") int limit
    );

    @Query(value = "SELECT chunk_content, (1 - (embedding <=> :queryEmbedding::vector)) AS similarity " +
            "FROM document_chunks " +
            "WHERE job_id = :jobId " +
            "AND (:companyId IS NULL OR company_id = :companyId) " +
            "AND (:expLevel IS NULL OR experience_level = :expLevel) " +
            "AND (:empType IS NULL OR employment_type = :empType) " +
            "AND chunk_type IN (:allowedTypes) " +
            "ORDER BY similarity DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<Object[]> vectorSearchWithTypes(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("jobId") Long jobId,
            @Param("companyId") Long companyId,
            @Param("expLevel") String expLevel,
            @Param("empType") String empType,
            @Param("allowedTypes") List<String> allowedTypes,
            @Param("limit") int limit
    );

    @Query(value = "SELECT chunk_content, (1 - (embedding <=> :queryEmbedding::vector)) AS similarity " +
            "FROM document_chunks " +
            "WHERE job_id = :jobId " +
            "AND (:companyId IS NULL OR company_id = :companyId) " +
            "AND (:expLevel IS NULL OR experience_level = :expLevel) " +
            "AND (:empType IS NULL OR employment_type = :empType) " +
            "AND to_tsvector('english', chunk_content) @@ plainto_tsquery('english', :searchTerms)", nativeQuery = true)
    List<Object[]> ftsSearchWithoutTypes(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("jobId") Long jobId,
            @Param("companyId") Long companyId,
            @Param("expLevel") String expLevel,
            @Param("empType") String empType,
            @Param("searchTerms") String searchTerms
    );

    @Query(value = "SELECT chunk_content, (1 - (embedding <=> :queryEmbedding::vector)) AS similarity " +
            "FROM document_chunks " +
            "WHERE job_id = :jobId " +
            "AND (:companyId IS NULL OR company_id = :companyId) " +
            "AND (:expLevel IS NULL OR experience_level = :expLevel) " +
            "AND (:empType IS NULL OR employment_type = :empType) " +
            "AND chunk_type IN (:allowedTypes) " +
            "AND to_tsvector('english', chunk_content) @@ plainto_tsquery('english', :searchTerms)", nativeQuery = true)
    List<Object[]> ftsSearchWithTypes(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("jobId") Long jobId,
            @Param("companyId") Long companyId,
            @Param("expLevel") String expLevel,
            @Param("empType") String empType,
            @Param("allowedTypes") List<String> allowedTypes,
            @Param("searchTerms") String searchTerms
    );
}
