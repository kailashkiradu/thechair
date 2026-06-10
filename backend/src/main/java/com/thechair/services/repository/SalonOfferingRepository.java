package com.thechair.services.repository;

import com.thechair.salons.entity.Salon;
import com.thechair.services.entity.SalonOffering;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SalonOfferingRepository extends JpaRepository<SalonOffering, UUID> {
    List<SalonOffering> findBySalonAndActiveTrue(Salon salon);
    List<SalonOffering> findBySalon(Salon salon);
}
