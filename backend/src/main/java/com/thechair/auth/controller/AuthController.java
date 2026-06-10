package com.thechair.auth.controller;

import com.thechair.auth.dto.LoginRequest;
import com.thechair.auth.dto.RegisterRequest;
import com.thechair.common.dto.ApiResponse;
import com.thechair.auth.dto.AuthResponse;
import com.thechair.users.dto.UserResponse;
import com.thechair.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request, 
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        
        if (authResponse.getRefreshToken() != null) {
            setRefreshTokenCookie(response, authResponse.getRefreshToken());
            // Nullify refresh token in JSON response payload for security
            authResponse.setRefreshToken(null);
        }
        
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(authService.getMe(userDetails.getUsername())));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @RequestBody java.util.Map<String, String> body, 
            HttpServletResponse response) {
        String email = body.get("email");
        String code = body.get("code");
        AuthResponse authResponse = authService.verifyOtp(email, code);
        
        if (authResponse.getRefreshToken() != null) {
            setRefreshTokenCookie(response, authResponse.getRefreshToken());
            authResponse.setRefreshToken(null);
        }
        
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<?>> resendOtp(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        authService.resendOtp(email);
        return ResponseEntity.ok(ApiResponse.ok("Verification OTP code has been resent to your email."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest request, 
            HttpServletResponse response) {
        String refreshToken = getRefreshTokenFromCookie(request);
        AuthResponse authResponse = authService.rotateRefreshToken(refreshToken);
        
        if (authResponse.getRefreshToken() != null) {
            setRefreshTokenCookie(response, authResponse.getRefreshToken());
            authResponse.setRefreshToken(null);
        }
        
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(
            HttpServletRequest request, 
            HttpServletResponse response) {
        String refreshToken = getRefreshTokenFromCookie(request);
        authService.logout(refreshToken);
        setRefreshTokenCookie(response, null); // Clear cookie
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token != null ? token : "")
                .httpOnly(true)
                .secure(false) // Set to true in prod (requires HTTPS)
                .path("/")
                .maxAge(token != null ? 604800 : 0) // 7 days or immediately expire
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return java.util.Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(jakarta.servlet.http.Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
