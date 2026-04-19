package syncX.modules.support.repository;

import syncX.modules.support.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long> {
}

