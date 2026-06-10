package com.thechair.bookings.dto;

import com.thechair.bookings.entity.Waitlist;
import com.thechair.bookings.entity.WaitlistStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class WaitlistResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private UUID salonId;
    private String salonName;
    private UUID offeringId;
    private String offeringName;
    private LocalDate preferredDate;
    private LocalTime preferredTimeStart;
    private LocalTime preferredTimeEnd;
    private WaitlistStatus status;

    public static WaitlistResponse from(Waitlist item) {
        return WaitlistResponse.builder()
                .id(item.getId())
                .customerId(item.getCustomer().getId())
                .customerName(item.getCustomer().getName())
                .salonId(item.getSalon().getId())
                .salonName(item.getSalon().getName())
                .offeringId(item.getOffering().getId())
                .offeringName(item.getOffering().getName())
                .preferredDate(item.getPreferredDate())
                .preferredTimeStart(item.getPreferredTimeStart())
                .preferredTimeEnd(item.getPreferredTimeEnd())
                .status(item.getStatus())
                .build();
    }
}
