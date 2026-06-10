package com.thechair.auth.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UUID id;
    private String name;
    private String email;
    private String role;
    private boolean otpRequired;
    private String refreshToken;
}
