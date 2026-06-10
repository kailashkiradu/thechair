package com.thechair.staff.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StaffRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String specialty;
    private String photoUrl;
    private Integer experienceYears;
}
