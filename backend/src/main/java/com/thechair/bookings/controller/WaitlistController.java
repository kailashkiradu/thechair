package com.thechair.bookings.controller;

import com.thechair.bookings.dto.WaitlistRequest;
import com.thechair.bookings.dto.WaitlistResponse;
import com.thechair.bookings.service.WaitlistService;
import com.thechair.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    @PostMapping("/api/v1/customer/waitlist")
    public ResponseEntity<ApiResponse<WaitlistResponse>> joinWaitlist(
            @Valid @RequestBody WaitlistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                waitlistService.joinWaitlist(request, userDetails.getUsername())));
    }

    @GetMapping("/api/v1/customer/waitlist")
    public ResponseEntity<ApiResponse<List<WaitlistResponse>>> getCustomerWaitlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                waitlistService.getCustomerWaitlist(userDetails.getUsername())));
    }

    @DeleteMapping("/api/v1/customer/waitlist/{id}")
    public ResponseEntity<ApiResponse<?>> leaveWaitlist(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        waitlistService.leaveWaitlist(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Removed from waitlist"));
    }

    @GetMapping("/api/v1/owner/waitlist")
    public ResponseEntity<ApiResponse<List<WaitlistResponse>>> getOwnerWaitlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                waitlistService.getOwnerWaitlist(userDetails.getUsername())));
    }
}
