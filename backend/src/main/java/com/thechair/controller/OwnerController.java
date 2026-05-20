package com.thechair.controller;

import com.thechair.dto.request.OfferingRequest;
import com.thechair.dto.request.SalonRequest;
import com.thechair.dto.request.SlotGenerateRequest;
import com.thechair.dto.response.*;
import com.thechair.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping("/salon")
    public ResponseEntity<ApiResponse<SalonResponse>> getMySalon(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getMySalon(u.getUsername())));
    }

    @PostMapping("/salon")
    public ResponseEntity<ApiResponse<SalonResponse>> createSalon(
            @Valid @RequestBody SalonRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.createSalon(request, u.getUsername())));
    }

    @PutMapping("/salon")
    public ResponseEntity<ApiResponse<SalonResponse>> updateSalon(
            @Valid @RequestBody SalonRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.updateSalon(request, u.getUsername())));
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<OfferingResponse>>> getServices(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getOfferings(u.getUsername())));
    }

    @PostMapping("/services")
    public ResponseEntity<ApiResponse<OfferingResponse>> addService(
            @Valid @RequestBody OfferingRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.addOffering(request, u.getUsername())));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<OfferingResponse>> updateService(
            @PathVariable UUID id,
            @Valid @RequestBody OfferingRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.updateOffering(id, request, u.getUsername())));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<?>> deleteService(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails u) {
        ownerService.deleteOffering(id, u.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Service removed"));
    }

    @PostMapping("/slots/generate")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> generateSlots(
            @Valid @RequestBody SlotGenerateRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.generateSlots(request, u.getUsername())));
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getSlots(u.getUsername(), date)));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getBookings(u.getUsername())));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(
                ownerService.updateBookingStatus(id, body.get("status"), u.getUsername())));
    }
}
