package com.thechair.bookings.repository;

import com.thechair.salons.entity.Salon;
import com.thechair.services.entity.SalonOffering;
import com.thechair.bookings.entity.TimeSlot;
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

    List<TimeSlot> findByStaffAndDate(com.thechair.staff.entity.Staff staff, LocalDate date);

    List<TimeSlot> findBySalonAndOfferingAndDateOrderByStartTime(Salon salon, SalonOffering offering, LocalDate date);

    boolean existsBySalonAndOfferingAndDateAndStartTime(Salon salon, SalonOffering offering, LocalDate date, LocalTime startTime);

    boolean existsByStaffAndDateAndStartTime(com.thechair.staff.entity.Staff staff, LocalDate date, LocalTime startTime);

    boolean existsBySalonAndOfferingAndStaffAndDateAndStartTime(Salon salon, SalonOffering offering, com.thechair.staff.entity.Staff staff, LocalDate date, LocalTime startTime);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TimeSlot t WHERE t.id = :id")
    Optional<TimeSlot> findByIdWithLock(@Param("id") UUID id);
}
