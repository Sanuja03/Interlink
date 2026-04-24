package syncX.modules.cjobpost.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.cjobpost.entity.Cjobpost;

@Repository
public interface CjobpostRepository extends JpaRepository<Cjobpost, Long> {
}