package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminCandidate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminCandidateRepository extends JpaRepository<AdminCandidate, UUID> {

    Optional<AdminCandidate> findByUserId(UUID userId);

    // Used for name search on the users list (search by candidate name)
    @Query("""
        SELECT c FROM AdminCandidate c
        WHERE LOWER(CONCAT(c.firstName, ' ', c.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))
    """)
    List<AdminCandidate> searchByName(@Param("name") String name);
}