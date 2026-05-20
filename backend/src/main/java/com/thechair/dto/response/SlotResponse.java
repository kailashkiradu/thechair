package com.thechair.dto.response;

import com.thechair.entity.TimeSlot;
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
                .build();
    }
}
