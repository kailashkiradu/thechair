package com.thechair.bookings.repository;

import com.thechair.bookings.entity.Booking;
import com.thechair.salons.entity.Salon;
import com.thechair.users.entity.User;
import com.thechair.bookings.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Booking> findBySalonOrderByCreatedAtDesc(Salon salon);
    List<Booking> findAllByOrderByCreatedAtDesc();
    long countByStatus(BookingStatus status);
}
