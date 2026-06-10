package com.thechair.staff.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffLeaveRequest {

    @NotNull(message = "Leave date is required")
    private LocalDate leaveDate;

    private LocalTime startTime; // Null = Full Day

    private LocalTime endTime; // Null = Full Day

    private String reason;
}
