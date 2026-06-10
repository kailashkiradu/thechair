package com.thechair.bookings.repository;

import com.thechair.bookings.entity.Waitlist;
import com.thechair.bookings.entity.WaitlistStatus;
import com.thechair.salons.entity.Salon;
import com.thechair.services.entity.SalonOffering;
import com.thechair.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, UUID> {
    List<Waitlist> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Waitlist> findBySalonIdOrderByCreatedAtDesc(UUID salonId);
    List<Waitlist> findBySalonAndOfferingAndPreferredDateAndStatus(
            Salon salon, SalonOffering offering, LocalDate date, WaitlistStatus status);
}
