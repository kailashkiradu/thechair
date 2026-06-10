package com.thechair.salons.dto;

import com.thechair.salons.entity.SalonException;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class SalonExceptionResponse {
    private UUID id;
    private UUID salonId;
    private LocalDate exceptionDate;
    private boolean isClosed;
    private LocalTime openTime;
    private LocalTime closeTime;
    private String reason;

    public static SalonExceptionResponse from(SalonException exception) {
        return SalonExceptionResponse.builder()
                .id(exception.getId())
                .salonId(exception.getSalon().getId())
                .exceptionDate(exception.getExceptionDate())
                .isClosed(exception.isClosed())
                .openTime(exception.getOpenTime())
                .closeTime(exception.getCloseTime())
                .reason(exception.getReason())
                .build();
    }
}
