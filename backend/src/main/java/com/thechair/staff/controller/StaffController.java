package com.thechair.staff.controller;

import com.thechair.common.dto.ApiResponse;
import com.thechair.staff.dto.StaffRequest;
import com.thechair.staff.dto.StaffResponse;
import com.thechair.staff.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    // Public endpoint for customers to get staff of a salon
    @GetMapping("/salons/{salonId}/staff")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getSalonStaff(@PathVariable UUID salonId) {
        return ResponseEntity.ok(ApiResponse.success(staffService.getStaffBySalonId(salonId)));
    }

    // Owner endpoints
    @GetMapping("/owner/staff")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getMyStaff(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(staffService.getStaffForOwner(u.getUsername())));
    }

    @PostMapping("/owner/staff")
    public ResponseEntity<ApiResponse<StaffResponse>> addStaff(
            @Valid @RequestBody StaffRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(staffService.addStaff(request, u.getUsername())));
    }

    @PutMapping("/owner/staff/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable UUID id,
            @Valid @RequestBody StaffRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(staffService.updateStaff(id, request, u.getUsername())));
    }

    @PatchMapping("/owner/staff/{id}/toggle")
    public ResponseEntity<ApiResponse<StaffResponse>> toggleAvailability(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(staffService.toggleAvailability(id, u.getUsername())));
    }

    @DeleteMapping("/owner/staff/{id}")
    public ResponseEntity<ApiResponse<?>> deleteStaff(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails u) {
        staffService.deleteStaff(id, u.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Staff member removed successfully"));
    }
}
