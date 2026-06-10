package com.thechair.staff.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "staff_leaves")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "staff")
@EqualsAndHashCode(exclude = "staff")
public class StaffLeave {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(name = "leave_date", nullable = false)
    private LocalDate leaveDate;

    @Column(name = "start_time")
    private LocalTime startTime; // Null = Full Day Leave

    @Column(name = "end_time")
    private LocalTime endTime; // Null = Full Day Leave

    @Column
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
