package com.thechair.bookings.dto;

import com.thechair.bookings.entity.Booking;
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
    private String bookingType;
    private UUID staffId;
    private String staffName;

    public static BookingResponse from(Booking b) {
        UUID customerId = b.getCustomer() != null ? b.getCustomer().getId() : null;
        String name = b.getCustomer() != null ? b.getCustomer().getName() : b.getCustomerName();
        String phone = b.getCustomer() != null ? b.getCustomer().getPhone() : b.getCustomerPhone();

        return BookingResponse.builder()
                .id(b.getId())
                .customerId(customerId)
                .customerName(name)
                .customerPhone(phone)
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
                .bookingType(b.getBookingType())
                .staffId(b.getStaff() != null ? b.getStaff().getId() : null)
                .staffName(b.getStaff() != null ? b.getStaff().getName() : null)
                .build();
    }
}
