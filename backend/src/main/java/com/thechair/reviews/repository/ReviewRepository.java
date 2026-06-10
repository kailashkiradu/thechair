package com.thechair.reviews.repository;

import com.thechair.reviews.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findBySalonId(UUID salonId);
    List<Review> findByStaffId(UUID staffId);
    boolean existsByBookingId(UUID bookingId);
}
