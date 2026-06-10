package com.thechair.staff.dto;

import com.thechair.staff.entity.Staff;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
    private UUID id;
    private UUID salonId;
    private String name;
    private String specialty;
    private String photoUrl;
    private Integer experienceYears;
    private BigDecimal averageRating;
    private boolean available;

    public static StaffResponse from(Staff staff) {
        return StaffResponse.builder()
                .id(staff.getId())
                .salonId(staff.getSalon().getId())
                .name(staff.getName())
                .specialty(staff.getSpecialty())
                .photoUrl(staff.getPhotoUrl())
                .experienceYears(staff.getExperienceYears())
                .averageRating(staff.getAverageRating())
                .available(staff.isAvailable())
                .build();
    }
}
