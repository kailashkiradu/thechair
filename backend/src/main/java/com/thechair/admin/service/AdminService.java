package com.thechair.admin.service;

import com.thechair.admin.dto.AdminStatsResponse;
import com.thechair.bookings.dto.BookingResponse;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.users.dto.UserResponse;
import com.thechair.salons.entity.Salon;
import com.thechair.bookings.entity.BookingStatus;
import com.thechair.salons.entity.SalonStatus;
import com.thechair.common.exception.BadRequestException;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.bookings.repository.BookingRepository;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final SalonRepository salonRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public List<SalonResponse> getAllSalons(String status) {
        if (status != null && !status.isBlank()) {
            try {
                SalonStatus salonStatus = SalonStatus.valueOf(status.toUpperCase());
                return salonRepository.findByStatus(salonStatus).stream().map(SalonResponse::from).toList();
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + status);
            }
        }
        return salonRepository.findAll().stream().map(SalonResponse::from).toList();
    }

    @Transactional
    public SalonResponse approveSalon(UUID salonId) {
        Salon salon = findSalon(salonId);
        salon.setStatus(SalonStatus.APPROVED);
        salon.setRejectionReason(null);
        return SalonResponse.from(salonRepository.save(salon));
    }

    @Transactional
    public SalonResponse rejectSalon(UUID salonId, String reason) {
        Salon salon = findSalon(salonId);
        salon.setStatus(SalonStatus.REJECTED);
        salon.setRejectionReason(reason);
        return SalonResponse.from(salonRepository.save(salon));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(BookingResponse::from).toList();
    }

    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalSalons(salonRepository.count())
                .pendingSalons(salonRepository.countByStatus(SalonStatus.PENDING))
                .approvedSalons(salonRepository.countByStatus(SalonStatus.APPROVED))
                .totalBookings(bookingRepository.count())
                .confirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                .completedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED))
                .build();
    }

    private Salon findSalon(UUID id) {
        return salonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
    }
}
