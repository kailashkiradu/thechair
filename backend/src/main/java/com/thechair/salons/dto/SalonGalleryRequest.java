package com.thechair.salons.dto;

import com.thechair.salons.entity.SalonGalleryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SalonGalleryRequest {
    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotNull(message = "Image type is required")
    private SalonGalleryType imageType;

    private String description;
}
