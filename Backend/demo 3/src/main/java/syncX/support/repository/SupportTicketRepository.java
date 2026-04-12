package syncX.support.repository;

import syncX.support.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long> {
}

