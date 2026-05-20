package com.thechair.dto.response;

import com.thechair.entity.SalonOffering;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferingResponse {
    private UUID id;
    private UUID salonId;
    private String name;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private boolean active;

    public static OfferingResponse from(SalonOffering o) {
        return OfferingResponse.builder()
                .id(o.getId())
                .salonId(o.getSalon().getId())
                .name(o.getName())
                .description(o.getDescription())
                .duration(o.getDuration())
                .price(o.getPrice())
                .active(o.isActive())
                .build();
    }
}
