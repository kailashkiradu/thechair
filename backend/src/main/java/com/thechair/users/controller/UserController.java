package com.thechair.users.controller;

import com.thechair.common.dto.ApiResponse;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.users.dto.UpdateProfileRequest;
import com.thechair.users.dto.UserResponse;
import com.thechair.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(userDetails.getUsername())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(request, userDetails.getUsername())));
    }

    @PostMapping("/favorites/{salonId}")
    public ResponseEntity<ApiResponse<?>> addFavorite(
            @PathVariable UUID salonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.addFavoriteSalon(salonId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Salon added to favorites"));
    }

    @DeleteMapping("/favorites/{salonId}")
    public ResponseEntity<ApiResponse<?>> removeFavorite(
            @PathVariable UUID salonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.removeFavoriteSalon(salonId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Salon removed from favorites"));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<SalonResponse>>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getFavoriteSalons(userDetails.getUsername())));
    }

    @GetMapping("/favorites/{salonId}/status")
    public ResponseEntity<ApiResponse<Boolean>> getFavoriteStatus(
            @PathVariable UUID salonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.isSalonFavorite(salonId, userDetails.getUsername())));
    }
}
