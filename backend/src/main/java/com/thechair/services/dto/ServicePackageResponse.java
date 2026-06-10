package com.thechair.services.dto;

import com.thechair.services.entity.ServicePackage;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ServicePackageResponse {
    private UUID id;
    private UUID salonId;
    private String name;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private boolean active;
    private List<OfferingResponse> offerings;

    public static ServicePackageResponse from(ServicePackage pkg) {
        return ServicePackageResponse.builder()
                .id(pkg.getId())
                .salonId(pkg.getSalon().getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .duration(pkg.getDuration())
                .price(pkg.getPrice())
                .active(pkg.isActive())
                .offerings(pkg.getOfferings().stream().map(OfferingResponse::from).toList())
                .build();
    }
}
