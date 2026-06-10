package com.thechair.users.dto;

import com.thechair.users.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private LocalDateTime createdAt;

    private Integer noShowCount;
    private boolean restricted;
    private Long totalBookings;
    private Long cancelledBookings;
    private Long noShowBookings;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .noShowCount(user.getNoShowCount())
                .restricted(user.isRestricted())
                .build();
    }

    public static UserResponse from(User user, Long totalBookings, Long cancelledBookings, Long noShowBookings) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .noShowCount(user.getNoShowCount())
                .restricted(user.isRestricted())
                .totalBookings(totalBookings)
                .cancelledBookings(cancelledBookings)
                .noShowBookings(noShowBookings)
                .build();
    }
}
