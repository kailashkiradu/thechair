package com.thechair.salons.controller;

import com.thechair.services.dto.OfferingRequest;
import com.thechair.salons.dto.SalonRequest;
import com.thechair.bookings.dto.SlotGenerateRequest;
import com.thechair.common.dto.ApiResponse;
import com.thechair.bookings.dto.BookingResponse;
import com.thechair.bookings.dto.BookingRequest;
import com.thechair.services.dto.OfferingResponse;
import com.thechair.services.dto.ServicePackageRequest;
import com.thechair.services.dto.ServicePackageResponse;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.bookings.dto.SlotResponse;
import com.thechair.salons.service.OwnerService;
import com.thechair.bookings.service.BookingService;
import com.thechair.salons.dto.SalonExceptionRequest;
import com.thechair.salons.dto.SalonExceptionResponse;
import com.thechair.salons.dto.SalonGalleryRequest;
import com.thechair.salons.dto.SalonGalleryResponse;
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
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;
    private final BookingService bookingService;

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

    @PostMapping("/bookings/walk-in")
    public ResponseEntity<ApiResponse<BookingResponse>> createWalkInBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.createWalkInBooking(request, u.getUsername())));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(
                ownerService.updateBookingStatus(id, body.get("status"), u.getUsername())));
    }

    @PostMapping("/salon/exceptions")
    public ResponseEntity<ApiResponse<SalonExceptionResponse>> addSalonException(
            @Valid @RequestBody SalonExceptionRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.addSalonException(request, u.getUsername())));
    }

    @GetMapping("/salon/exceptions")
    public ResponseEntity<ApiResponse<List<SalonExceptionResponse>>> getSalonExceptions(
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getSalonExceptions(u.getUsername())));
    }

    @DeleteMapping("/salon/exceptions/{exceptionId}")
    public ResponseEntity<ApiResponse<?>> deleteSalonException(
            @PathVariable UUID exceptionId,
            @AuthenticationPrincipal UserDetails u) {
        ownerService.deleteSalonException(exceptionId, u.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Salon exception removed successfully"));
    }

    @PostMapping("/services/packages")
    public ResponseEntity<ApiResponse<ServicePackageResponse>> addServicePackage(
            @Valid @RequestBody ServicePackageRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.addServicePackage(request, u.getUsername())));
    }

    @PutMapping("/services/packages/{id}")
    public ResponseEntity<ApiResponse<ServicePackageResponse>> updateServicePackage(
            @PathVariable UUID id,
            @Valid @RequestBody ServicePackageRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.updateServicePackage(id, request, u.getUsername())));
    }

    @GetMapping("/services/packages")
    public ResponseEntity<ApiResponse<List<ServicePackageResponse>>> getServicePackages(
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getServicePackages(u.getUsername())));
    }

    @DeleteMapping("/services/packages/{id}")
    public ResponseEntity<ApiResponse<?>> deleteServicePackage(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails u) {
        ownerService.deleteServicePackage(id, u.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Combo package removed successfully"));
    }

    @PostMapping("/salon/gallery")
    public ResponseEntity<ApiResponse<SalonGalleryResponse>> addGalleryItem(
            @Valid @RequestBody SalonGalleryRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.addGalleryItem(request, u.getUsername())));
    }

    @GetMapping("/salon/gallery")
    public ResponseEntity<ApiResponse<List<SalonGalleryResponse>>> getGalleryItems(
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(ownerService.getGalleryItems(u.getUsername())));
    }

    @DeleteMapping("/salon/gallery/{itemId}")
    public ResponseEntity<ApiResponse<?>> deleteGalleryItem(
            @PathVariable UUID itemId,
            @AuthenticationPrincipal UserDetails u) {
        ownerService.deleteGalleryItem(itemId, u.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Gallery item removed successfully"));
    }
}
