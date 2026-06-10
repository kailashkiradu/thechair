package com.thechair.auth.service;

import com.thechair.auth.dto.LoginRequest;
import com.thechair.auth.dto.RegisterRequest;
import com.thechair.auth.dto.AuthResponse;
import com.thechair.users.dto.UserResponse;
import com.thechair.users.entity.User;
import com.thechair.common.exception.BadRequestException;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.users.repository.UserRepository;
import com.thechair.security.util.JwtUtil;
import com.thechair.auth.entity.RefreshToken;
import com.thechair.auth.repository.RefreshTokenRepository;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .enabled(false)
                .build();
        user = userRepository.save(user);
        otpService.generateAndSaveOtp(user.getEmail());
        
        return AuthResponse.builder()
                .otpRequired(true)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        if (!user.isEnabled()) {
            otpService.generateAndSaveOtp(user.getEmail());
            throw new BadRequestException("Your account is not verified yet. A verification OTP code has been sent to your email.");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshTokenStr = createRefreshToken(user);

        AuthResponse response = buildAuthResponse(token, user);
        response.setRefreshToken(refreshTokenStr);
        return response;
    }

    public UserResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.isEnabled()) {
            throw new BadRequestException("Account is already verified");
        }
        otpService.verifyOtp(email, code);
        user.setEnabled(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshTokenStr = createRefreshToken(user);

        AuthResponse response = buildAuthResponse(token, user);
        response.setRefreshToken(refreshTokenStr);
        return response;
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.isEnabled()) {
            throw new BadRequestException("Account is already verified");
        }
        otpService.generateAndSaveOtp(email);
    }

    @Transactional
    public AuthResponse rotateRefreshToken(String requestRefreshToken) {
        RefreshToken oldRefreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        User user = oldRefreshToken.getUser();

        // Check for reuse (RTR Security):
        // If a refresh token is reused (already revoked), it implies it was stolen!
        // In this case, we revoke ALL refresh tokens for this user to protect their account.
        if (oldRefreshToken.isRevoked()) {
            List<RefreshToken> activeTokens = refreshTokenRepository.findByUser(user);
            activeTokens.forEach(t -> t.setRevoked(true));
            refreshTokenRepository.saveAll(activeTokens);
            throw new BadRequestException("Refresh token has already been used. Stolen token family detected. All sessions revoked.");
        }

        // Check if expired
        if (oldRefreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(oldRefreshToken);
            throw new BadRequestException("Refresh token has expired. Please log in again.");
        }

        // Generate new Access and Refresh tokens (rotation)
        String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String newRefreshTokenStr = jwtUtil.generateRefreshToken(user.getEmail());

        // Revoke the old refresh token
        oldRefreshToken.setRevoked(true);
        oldRefreshToken.setReplacedByToken(newRefreshTokenStr);
        refreshTokenRepository.save(oldRefreshToken);

        // Save the new refresh token
        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenStr)
                .expiryDate(Instant.now().plusMillis(604800000)) // 7 days
                .build();
        refreshTokenRepository.save(newRefreshToken);

        AuthResponse response = buildAuthResponse(newAccessToken, user);
        response.setRefreshToken(newRefreshTokenStr);
        return response;
    }

    @Transactional
    public void logout(String requestRefreshToken) {
        if (requestRefreshToken != null) {
            refreshTokenRepository.findByToken(requestRefreshToken)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }
    }

    private String createRefreshToken(User user) {
        String tokenStr = jwtUtil.generateRefreshToken(user.getEmail());
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenStr)
                .expiryDate(Instant.now().plusMillis(604800000)) // 7 days
                .build();
        refreshTokenRepository.save(refreshToken);
        return tokenStr;
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
