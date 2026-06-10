package com.thechair.salons.dto;

import com.thechair.salons.entity.SalonGallery;
import com.thechair.salons.entity.SalonGalleryType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SalonGalleryResponse {
    private UUID id;
    private UUID salonId;
    private String imageUrl;
    private SalonGalleryType imageType;
    private String description;

    public static SalonGalleryResponse from(SalonGallery item) {
        return SalonGalleryResponse.builder()
                .id(item.getId())
                .salonId(item.getSalon().getId())
                .imageUrl(item.getImageUrl())
                .imageType(item.getImageType())
                .description(item.getDescription())
                .build();
    }
}
