package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminUser;

import java.util.List;
import java.util.UUID;

public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

    // Used for the users list page: search by email, filter by role
    @Query("""
        SELECT u FROM AdminUser u
        WHERE (:role IS NULL OR :role = '' OR LOWER(u.role) = LOWER(:role))
        AND (:search IS NULL OR :search = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY u.createdAt DESC
    """)
    List<AdminUser> searchUsers(
            @Param("role") String role,
            @Param("search") String search
    );
}