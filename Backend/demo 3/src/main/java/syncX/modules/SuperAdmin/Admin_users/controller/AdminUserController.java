package syncX.modules.SuperAdmin.Admin_users.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import syncX.modules.SuperAdmin.Admin_users.service.AdminUserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    // ================================================
    // 🔹 GET ALL USERS (users list page)
    //    Optional query params: ?search=john&role=candidate
    // ================================================
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role
    ) {
        try {
            return ResponseEntity.ok(adminUserService.getAllUsers(search, role));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================================================
    // 🔹 GET USER PROFILE (role-specific)
    //    Returns AdminCandidateProfileDto,
    //            AdminInterviewerProfileDto, or
    //            AdminCompanyAdminProfileDto
    //    based on the user's role
    // ================================================
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable UUID userId) {
        try {
            return ResponseEntity.ok(adminUserService.getUserProfile(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================================================
    // 🔹 SUSPEND USER
    // ================================================
    @PutMapping("/{userId}/suspend")
    public ResponseEntity<String> suspendUser(@PathVariable UUID userId) {
        try {
            adminUserService.suspendUser(userId);
            return ResponseEntity.ok("User suspended successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================================================
    // 🔹 RESTORE USER
    // ================================================
    @PutMapping("/{userId}/restore")
    public ResponseEntity<String> restoreUser(@PathVariable UUID userId) {
        try {
            adminUserService.restoreUser(userId);
            return ResponseEntity.ok("User restored successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================================================
    // 🔹 FLAG USER
    // ================================================
    @PutMapping("/{userId}/flag")
    public ResponseEntity<String> flagUser(@PathVariable UUID userId) {
        try {
            adminUserService.flagUser(userId);
            return ResponseEntity.ok("User flagged successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}