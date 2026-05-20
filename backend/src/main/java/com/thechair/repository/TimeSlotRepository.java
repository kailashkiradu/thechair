package com.thechair.repository;

import com.thechair.entity.Salon;
import com.thechair.entity.SalonOffering;
import com.thechair.entity.TimeSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {

    List<TimeSlot> findBySalonAndDateOrderByStartTime(Salon salon, LocalDate date);

    List<TimeSlot> findBySalonAndOfferingAndDateOrderByStartTime(Salon salon, SalonOffering offering, LocalDate date);

    boolean existsBySalonAndOfferingAndDateAndStartTime(Salon salon, SalonOffering offering, LocalDate date, LocalTime startTime);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TimeSlot t WHERE t.id = :id")
    Optional<TimeSlot> findByIdWithLock(@Param("id") UUID id);
}
