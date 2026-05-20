package com.thechair.dto.response;

import com.thechair.entity.Booking;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private String customerPhone;
    private UUID salonId;
    private String salonName;
    private UUID offeringId;
    private String offeringName;
    private UUID slotId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private String notes;
    private LocalDateTime createdAt;

    public static BookingResponse from(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getName())
                .customerPhone(b.getCustomer().getPhone())
                .salonId(b.getSalon().getId())
                .salonName(b.getSalon().getName())
                .offeringId(b.getOffering().getId())
                .offeringName(b.getOffering().getName())
                .slotId(b.getSlot().getId())
                .date(b.getSlot().getDate())
                .startTime(b.getSlot().getStartTime())
                .endTime(b.getSlot().getEndTime())
                .status(b.getStatus().name())
                .paymentStatus(b.getPaymentStatus().name())
                .totalAmount(b.getTotalAmount())
                .notes(b.getNotes())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
