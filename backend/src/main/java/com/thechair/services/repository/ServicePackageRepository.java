package com.thechair.services.repository;

import com.thechair.salons.entity.Salon;
import com.thechair.services.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServicePackageRepository extends JpaRepository<ServicePackage, UUID> {
    List<ServicePackage> findBySalonAndActiveTrue(Salon salon);
    List<ServicePackage> findBySalon(Salon salon);
}
