package com.thechair.salons.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {
    private Long totalBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long noShowBookings;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private Long waitlistCount;
}
