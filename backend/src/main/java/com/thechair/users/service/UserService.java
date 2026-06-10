package com.thechair.users.service;

import com.thechair.bookings.entity.BookingStatus;
import com.thechair.bookings.repository.BookingRepository;
import com.thechair.common.exception.ConflictException;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.salons.entity.FavoriteSalon;
import com.thechair.salons.entity.Salon;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.salons.repository.FavoriteSalonRepository;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.users.dto.UpdateProfileRequest;
import com.thechair.users.dto.UserResponse;
import com.thechair.users.entity.User;
import com.thechair.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final SalonRepository salonRepository;
    private final FavoriteSalonRepository favoriteSalonRepository;
    private final BookingRepository bookingRepository;

    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long total = bookingRepository.countByCustomer(user);
        long cancelled = bookingRepository.countByCustomerAndStatus(user, BookingStatus.CANCELLED);
        long noShow = bookingRepository.countByCustomerAndStatus(user, BookingStatus.NO_SHOW);

        return UserResponse.from(user, total, cancelled, noShow);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        User saved = userRepository.save(user);

        long total = bookingRepository.countByCustomer(saved);
        long cancelled = bookingRepository.countByCustomerAndStatus(saved, BookingStatus.CANCELLED);
        long noShow = bookingRepository.countByCustomerAndStatus(saved, BookingStatus.NO_SHOW);

        return UserResponse.from(saved, total, cancelled, noShow);
    }

    @Transactional
    public void addFavoriteSalon(UUID salonId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));

        boolean exists = favoriteSalonRepository.existsByCustomerAndSalon(user, salon);
        if (exists) {
            throw new ConflictException("Salon is already in your favorites");
        }

        FavoriteSalon fav = FavoriteSalon.builder()
                .customer(user)
                .salon(salon)
                .build();
        favoriteSalonRepository.save(fav);
    }

    @Transactional
    public void removeFavoriteSalon(UUID salonId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));

        FavoriteSalon fav = favoriteSalonRepository.findByCustomerAndSalon(user, salon)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found in your favorites"));

        favoriteSalonRepository.delete(fav);
    }

    public List<SalonResponse> getFavoriteSalons(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return favoriteSalonRepository.findByCustomer(user)
                .stream()
                .map(fav -> SalonResponse.from(fav.getSalon()))
                .toList();
    }

    public boolean isSalonFavorite(UUID salonId, String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) return false;

        Salon salon = salonRepository.findById(salonId)
                .orElse(null);
        if (salon == null) return false;

        return favoriteSalonRepository.existsByCustomerAndSalon(user, salon);
    }
}
