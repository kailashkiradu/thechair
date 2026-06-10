package com.thechair.salons.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "salon_exceptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "salon")
@EqualsAndHashCode(exclude = "salon")
public class SalonException {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;

    @Column(name = "exception_date", nullable = false)
    private LocalDate exceptionDate;

    @Column(name = "is_closed", nullable = false)
    @Builder.Default
    private boolean isClosed = true;

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @Column
    private String reason;
}
