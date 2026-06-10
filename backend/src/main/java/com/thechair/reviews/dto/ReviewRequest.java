package com.thechair.reviews.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReviewRequest {
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;

    @NotNull(message = "Salon rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer salonRating;

    @NotNull(message = "Stylist rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer staffRating;

    private String comment;
}
