package com.thechair.salons.dto;
import com.thechair.salons.entity.Salon;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SalonRequest {
    @NotBlank(message = "Salon name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String phone;
    private String email;
    private String category;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
}
