package com.thechair.salons.entity;

import com.thechair.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "favorite_salons", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"customer_id", "salon_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteSalon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
