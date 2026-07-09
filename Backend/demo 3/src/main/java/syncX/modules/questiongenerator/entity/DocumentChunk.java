package syncX.modules.questiongenerator.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "document_chunks")
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "chunk_content", length = 2000)
    private String chunkContent;

    @Column(name = "chunk_type")
    private String chunkType;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "employment_type")
    private String employmentType;
}
