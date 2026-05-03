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

    // Service layer for handling user-related operations
    @Autowired
    private AdminUserService adminUserService;

    // Get all users with optional search and role filters
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search, // Optional search keyword
            @RequestParam(required = false) String role    // Optional role filter
    ) {
        try {
            // Fetch filtered user list
            return ResponseEntity.ok(adminUserService.getAllUsers(search, role));
        } catch (RuntimeException e) {
            // Return error message if something goes wrong
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get detailed profile of a user based on their role
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable UUID userId) {
        try {
            // Fetch role-specific user profile
            return ResponseEntity.ok(adminUserService.getUserProfile(userId));
        } catch (RuntimeException e) {
            // Return error message if user is not found or invalid
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Suspend a user account
    @PutMapping("/{userId}/suspend")
    public ResponseEntity<String> suspendUser(@PathVariable UUID userId) {
        try {
            // Update user status to suspended
            adminUserService.suspendUser(userId);
            return ResponseEntity.ok("User suspended successfully");
        } catch (RuntimeException e) {
            // Return error message if operation fails
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Restore a suspended user account
    @PutMapping("/{userId}/restore")
    public ResponseEntity<String> restoreUser(@PathVariable UUID userId) {
        try {
            // Reset user status to active
            adminUserService.restoreUser(userId);
            return ResponseEntity.ok("User restored successfully");
        } catch (RuntimeException e) {
            // Return error message if operation fails
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Flag a user for review or issues
    @PutMapping("/{userId}/flag")
    public ResponseEntity<String> flagUser(@PathVariable UUID userId) {
        try {
            // Mark user as flagged
            adminUserService.flagUser(userId);
            return ResponseEntity.ok("User flagged successfully");
        } catch (RuntimeException e) {
            // Return error message if operation fails
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Remove flag from a user
    @PutMapping("/{userId}/unflag")
    public ResponseEntity<String> unflagUser(@PathVariable UUID userId) {
        try {
            // Reset flagged status
            adminUserService.unflagUser(userId);
            return ResponseEntity.ok("User unflagged successfully");
        } catch (RuntimeException e) {
            // Return error message if operation fails
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}