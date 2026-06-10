package com.thechair.salons.repository;

import com.thechair.salons.entity.SalonGallery;
import com.thechair.salons.entity.SalonGalleryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalonGalleryRepository extends JpaRepository<SalonGallery, UUID> {
    List<SalonGallery> findBySalonId(UUID salonId);
    List<SalonGallery> findBySalonIdAndImageType(UUID salonId, SalonGalleryType imageType);
}
