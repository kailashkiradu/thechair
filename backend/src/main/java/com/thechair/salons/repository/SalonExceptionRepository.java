package com.thechair.salons.repository;

import com.thechair.salons.entity.SalonException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalonExceptionRepository extends JpaRepository<SalonException, UUID> {
    List<SalonException> findBySalonId(UUID salonId);
    Optional<SalonException> findBySalonIdAndExceptionDate(UUID salonId, LocalDate date);
}
