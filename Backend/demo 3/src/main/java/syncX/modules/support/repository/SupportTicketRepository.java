package syncX.modules.support.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.support.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    // ── jpql - for entities ──────────────────────────────────────────────────

    List<SupportTicket> findByUserId(UUID userId);

    @Query("SELECT t FROM SupportTicket t LEFT JOIN FETCH t.responses WHERE t.id = :id")
    Optional<SupportTicket> findByIdWithResponses(@Param("id") Long id);

    // ── look up the role for a given user directly from public.users ─
    // This avoids depending on the JWT role claim (which Supabase sets to
    // "authenticated" for everyone by default).
    @Query(value = "SELECT role FROM public.users WHERE user_id = :userId", nativeQuery = true)
    Optional<String> findRoleByUserId(@Param("userId") UUID userId);
}