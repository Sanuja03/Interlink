package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminCandidateSkill;

import java.util.List;
import java.util.UUID;

public interface AdminCandidateSkillsRepository extends JpaRepository<AdminCandidateSkill, Long> {

    List<AdminCandidateSkill> findByCandidateId(UUID candidateId);
}