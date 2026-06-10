package com.thechair.salons.service;

import com.thechair.services.dto.OfferingResponse;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.bookings.dto.SlotResponse;
import com.thechair.salons.entity.Salon;
import com.thechair.services.entity.SalonOffering;
import com.thechair.salons.entity.SalonStatus;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.services.repository.SalonOfferingRepository;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.bookings.repository.TimeSlotRepository;
import com.thechair.salons.repository.SalonGalleryRepository;
import com.thechair.salons.dto.SalonGalleryResponse;
import com.thechair.services.repository.ServicePackageRepository;
import com.thechair.services.dto.ServicePackageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalonService {

    private final SalonRepository salonRepository;
    private final SalonOfferingRepository offeringRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final SalonGalleryRepository salonGalleryRepository;
    private final ServicePackageRepository servicePackageRepository;

    public List<SalonResponse> getApprovedSalons(String query, Double lat, Double lon, Double radius) {
        List<Salon> salons = (query != null && !query.isBlank())
                ? salonRepository.searchApproved(query.trim())
                : salonRepository.findByStatus(SalonStatus.APPROVED);

        return salons.stream()
                .map(salon -> {
                    SalonResponse resp = SalonResponse.from(salon);
                    if (lat != null && lon != null && salon.getLatitude() != null && salon.getLongitude() != null) {
                        double distance = calculateDistance(lat, lon, salon.getLatitude(), salon.getLongitude());
                        resp.setDistance(Math.round(distance * 10.0) / 10.0);
                    }
                    return resp;
                })
                .filter(resp -> {
                    if (radius != null && resp.getDistance() != null) {
                        return resp.getDistance() <= radius;
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    if (a.getDistance() != null && b.getDistance() != null) {
                        return Double.compare(a.getDistance(), b.getDistance());
                    }
                    return 0;
                })
                .toList();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public SalonResponse getSalon(UUID id) {
        return SalonResponse.from(findApprovedSalon(id));
    }

    public List<OfferingResponse> getSalonOfferings(UUID salonId) {
        Salon salon = findApprovedSalon(salonId);
        return offeringRepository.findBySalonAndActiveTrue(salon)
                .stream().map(OfferingResponse::from).toList();
    }

    public List<SlotResponse> getAvailableSlots(UUID salonId, UUID offeringId, LocalDate date) {
        Salon salon = findApprovedSalon(salonId);
        SalonOffering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        return timeSlotRepository
                .findBySalonAndOfferingAndDateOrderByStartTime(salon, offering, date)
                .stream()
                .filter(s -> !s.isBooked())
                .map(SlotResponse::from)
                .toList();
    }

    private Salon findApprovedSalon(UUID id) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));
        if (salon.getStatus() != SalonStatus.APPROVED) {
            throw new ResourceNotFoundException("Salon not found");
        }
        return salon;
    }

    public List<SalonGalleryResponse> getSalonGallery(UUID salonId) {
        Salon salon = findApprovedSalon(salonId);
        return salonGalleryRepository.findBySalonId(salon.getId()).stream()
                .map(SalonGalleryResponse::from)
                .toList();
    }

    public List<ServicePackageResponse> getSalonPackages(UUID salonId) {
        Salon salon = findApprovedSalon(salonId);
        return servicePackageRepository.findBySalonAndActiveTrue(salon).stream()
                .map(ServicePackageResponse::from)
                .toList();
    }
}
