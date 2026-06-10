package com.thechair.salons.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueTrendItem {
    private LocalDate date;
    private BigDecimal revenue;
    private Integer bookingsCount;
}
