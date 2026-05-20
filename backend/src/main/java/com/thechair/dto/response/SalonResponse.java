package com.thechair.dto.response;

import com.thechair.entity.Salon;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalonResponse {
    private UUID id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String category;
    private String imageUrl;
    private String status;
    private String rejectionReason;
    private UUID ownerId;
    private String ownerName;
    private LocalDateTime createdAt;

    public static SalonResponse from(Salon salon) {
        return SalonResponse.builder()
                .id(salon.getId())
                .name(salon.getName())
                .description(salon.getDescription())
                .address(salon.getAddress())
                .city(salon.getCity())
                .phone(salon.getPhone())
                .email(salon.getEmail())
                .category(salon.getCategory())
                .imageUrl(salon.getImageUrl())
                .status(salon.getStatus().name())
                .rejectionReason(salon.getRejectionReason())
                .ownerId(salon.getOwner().getId())
                .ownerName(salon.getOwner().getName())
                .createdAt(salon.getCreatedAt())
                .build();
    }
}
