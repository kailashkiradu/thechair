package com.thechair.reviews.dto;

import com.thechair.reviews.entity.Review;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private UUID id;
    private UUID bookingId;
    private UUID customerId;
    private String customerName;
    private UUID salonId;
    private UUID staffId;
    private String staffName;
    private Integer salonRating;
    private Integer staffRating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .bookingId(r.getBooking().getId())
                .customerId(r.getCustomer().getId())
                .customerName(r.getCustomer().getName())
                .salonId(r.getSalon().getId())
                .staffId(r.getStaff().getId())
                .staffName(r.getStaff().getName())
                .salonRating(r.getSalonRating())
                .staffRating(r.getStaffRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
