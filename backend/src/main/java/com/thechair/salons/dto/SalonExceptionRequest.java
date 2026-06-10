package com.thechair.salons.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SalonExceptionRequest {
    @NotNull(message = "Date is required")
    private LocalDate exceptionDate;

    private boolean isClosed = true;

    private LocalTime openTime;

    private LocalTime closeTime;

    private String reason;
}
