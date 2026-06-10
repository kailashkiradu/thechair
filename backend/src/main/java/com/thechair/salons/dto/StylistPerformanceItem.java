package com.thechair.salons.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StylistPerformanceItem {
    private UUID staffId;
    private String staffName;
    private Integer bookingsCount;
    private Integer completedCount;
    private BigDecimal totalRevenue;
}
