package syncX.modules.InterviewProcess.InterviewRequest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewRequestRepository
        extends JpaRepository<InterviewRequest, UUID> {

    List<InterviewRequest> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    List<InterviewRequest> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId);

    boolean existsByCandidateIdAndJobApplicationIdAndStatus(
            UUID candidateId, Long jobApplicationId, String status);

    @Query("SELECT ir FROM InterviewRequest ir LEFT JOIN FETCH ir.interviewers " +
            "WHERE ir.companyId = :companyId AND ir.candidateId = :candidateId " +
            "AND ir.jobApplicationId = :jobApplicationId AND ir.status <> 'cancelled' " +
            "ORDER BY ir.createdAt DESC")
    List<InterviewRequest> findActiveByCandidateAndApplication(
            @Param("companyId") UUID companyId,
            @Param("candidateId") UUID candidateId,
            @Param("jobApplicationId") Long jobApplicationId);


    default Optional<InterviewRequest> findFirstActiveByCandidateAndApplication(
            UUID companyId, UUID candidateId, Long jobApplicationId) {
        List<InterviewRequest> list =
                findActiveByCandidateAndApplication(companyId, candidateId, jobApplicationId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Query("SELECT ir FROM InterviewRequest ir LEFT JOIN FETCH ir.interviewers " +
            "WHERE ir.companyId = :companyId " +
            "AND (:jobApplicationId IS NULL OR ir.jobApplicationId = :jobApplicationId) " +
            "AND (:jobId IS NULL OR ir.jobId = :jobId) " +
            "ORDER BY ir.createdAt DESC")
    List<InterviewRequest> findForCompany(
            @Param("companyId") UUID companyId,
            @Param("jobApplicationId") Long jobApplicationId,
            @Param("jobId") Long jobId);


    @Query("SELECT ir FROM InterviewRequest ir LEFT JOIN FETCH ir.interviewers " +
            "WHERE ir.requestId IN (" +
            "  SELECT DISTINCT iri.interviewRequest.requestId FROM InterviewRequestInterviewer iri " +
            "  WHERE iri.interviewerUserId = :userId " +
            "  AND iri.responseStatus = 'pending' " +
            "  AND iri.interviewRequest.status = 'pending'" +
            ") ORDER BY ir.interviewDate ASC, ir.interviewTime ASC")
    List<InterviewRequest> findPendingForInterviewer(@Param("userId") UUID userId);

    @Query("SELECT COUNT(iri) FROM InterviewRequestInterviewer iri " +
            "WHERE iri.interviewerUserId = :interviewerUserId " +
            "AND LOWER(iri.responseStatus) = 'pending' " +
            "AND LOWER(iri.interviewRequest.status) = 'pending'")
    long countPendingForInterviewer(@Param("interviewerUserId") UUID interviewerUserId);

    @Query("SELECT ir FROM InterviewRequest ir LEFT JOIN FETCH ir.interviewers " +
            "WHERE ir.requestId = :requestId")
    Optional<InterviewRequest> findByIdWithInterviewers(@Param("requestId") UUID requestId);
}