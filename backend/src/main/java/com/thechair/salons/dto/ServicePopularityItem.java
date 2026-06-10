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
public class ServicePopularityItem {
    private UUID serviceId;
    private String serviceName;
    private Integer bookingsCount;
    private BigDecimal totalRevenue;
}
