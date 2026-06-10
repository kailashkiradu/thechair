package com.thechair.bookings.dto;

import com.thechair.bookings.entity.TimeSlot;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotResponse {
    private UUID id;
    private UUID salonId;
    private UUID offeringId;
    private String offeringName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean booked;
    private UUID staffId;
    private String staffName;

    public static SlotResponse from(TimeSlot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .salonId(slot.getSalon().getId())
                .offeringId(slot.getOffering().getId())
                .offeringName(slot.getOffering().getName())
                .date(slot.getDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .booked(slot.isBooked())
                .staffId(slot.getStaff() != null ? slot.getStaff().getId() : null)
                .staffName(slot.getStaff() != null ? slot.getStaff().getName() : null)
                .build();
    }
}
