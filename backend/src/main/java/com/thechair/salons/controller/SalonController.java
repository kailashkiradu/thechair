package com.thechair.salons.controller;

import com.thechair.common.dto.ApiResponse;
import com.thechair.services.dto.OfferingResponse;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.bookings.dto.SlotResponse;
import com.thechair.salons.dto.SalonGalleryResponse;
import com.thechair.services.dto.ServicePackageResponse;
import com.thechair.salons.service.SalonService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/salons")
@RequiredArgsConstructor
public class SalonController {

    private final SalonService salonService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalonResponse>>> getSalons(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(ApiResponse.success(salonService.getApprovedSalons(query)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalonResponse>> getSalon(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(salonService.getSalon(id)));
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<ApiResponse<List<OfferingResponse>>> getServices(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(salonService.getSalonOfferings(id)));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @PathVariable UUID id,
            @RequestParam UUID serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(salonService.getAvailableSlots(id, serviceId, date)));
    }

    @GetMapping("/{id}/gallery")
    public ResponseEntity<ApiResponse<List<SalonGalleryResponse>>> getSalonGallery(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(salonService.getSalonGallery(id)));
    }

    @GetMapping("/{id}/packages")
    public ResponseEntity<ApiResponse<List<ServicePackageResponse>>> getSalonPackages(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(salonService.getSalonPackages(id)));
    }
}
