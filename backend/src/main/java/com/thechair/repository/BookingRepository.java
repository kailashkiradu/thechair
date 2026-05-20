package com.thechair.repository;

import com.thechair.entity.Booking;
import com.thechair.entity.Salon;
import com.thechair.entity.User;
import com.thechair.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Booking> findBySalonOrderByCreatedAtDesc(Salon salon);
    List<Booking> findAllByOrderByCreatedAtDesc();
    long countByStatus(BookingStatus status);
}
