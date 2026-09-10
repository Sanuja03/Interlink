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
    // NOTE: "delete" on a ticket is a soft delete (see SupportTicket.deleted) —
    // every normal read path below excludes deleted=true rows so they behave
    // exactly as if the row were gone, without actually removing it.

    List<SupportTicket> findByUserIdAndDeletedFalse(UUID userId);

    List<SupportTicket> findByDeletedFalse();

    Optional<SupportTicket> findByIdAndDeletedFalse(Long id);

    @Query("SELECT t FROM SupportTicket t LEFT JOIN FETCH t.responses WHERE t.id = :id AND t.deleted = false")
    Optional<SupportTicket> findByIdWithResponses(@Param("id") Long id);

    // ── look up the role for a given user directly from public.users ─
    // This avoids depending on the JWT role claim (which Supabase sets to
    // "authenticated" for everyone by default).
    @Query(value = "SELECT role FROM public.users WHERE user_id = :userId", nativeQuery = true)
    Optional<String> findRoleByUserId(@Param("userId") UUID userId);
}