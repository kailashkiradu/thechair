package com.thechair.admin.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalSalons;
    private long pendingSalons;
    private long approvedSalons;
    private long totalBookings;
    private long confirmedBookings;
    private long completedBookings;
}
