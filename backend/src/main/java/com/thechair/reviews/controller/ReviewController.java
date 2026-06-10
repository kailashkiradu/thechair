package com.thechair.reviews.controller;

import com.thechair.common.dto.ApiResponse;
import com.thechair.reviews.dto.ReviewRequest;
import com.thechair.reviews.dto.ReviewResponse;
import com.thechair.reviews.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.createReview(request, u.getUsername())));
    }

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getSalonReviews(@PathVariable UUID salonId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getSalonReviews(salonId)));
    }
}
