package com.thechair.bookings.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class WaitlistRequest {
    @NotNull(message = "Salon ID is required")
    private UUID salonId;

    @NotNull(message = "Offering ID is required")
    private UUID offeringId;

    @NotNull(message = "Preferred date is required")
    private LocalDate preferredDate;

    private LocalTime preferredTimeStart;
    
    private LocalTime preferredTimeEnd;
}
