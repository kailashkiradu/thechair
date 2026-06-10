package com.thechair.admin.controller;

import com.thechair.admin.dto.AdminStatsResponse;
import com.thechair.common.dto.ApiResponse;
import com.thechair.bookings.dto.BookingResponse;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.users.dto.UserResponse;
import com.thechair.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    @GetMapping("/salons")
    public ResponseEntity<ApiResponse<List<SalonResponse>>> getSalons(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllSalons(status)));
    }

    @PutMapping("/salons/{id}/approve")
    public ResponseEntity<ApiResponse<SalonResponse>> approveSalon(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.approveSalon(id)));
    }

    @PutMapping("/salons/{id}/reject")
    public ResponseEntity<ApiResponse<SalonResponse>> rejectSalon(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(adminService.rejectSalon(id, body.get("reason"))));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBookings()));
    }
}
