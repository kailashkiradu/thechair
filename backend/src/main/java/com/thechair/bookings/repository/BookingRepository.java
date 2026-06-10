package com.thechair.bookings.repository;

import com.thechair.bookings.entity.Booking;
import com.thechair.salons.entity.Salon;
import com.thechair.users.entity.User;
import com.thechair.bookings.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Booking> findBySalonOrderByCreatedAtDesc(Salon salon);
    List<Booking> findAllByOrderByCreatedAtDesc();
    long countByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.salon = :salon AND b.slot.date = :date")
    List<Booking> findBySalonAndSlotDate(@Param("salon") Salon salon, @Param("date") LocalDate date);
}
