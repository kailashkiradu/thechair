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

    public List<SalonResponse> getApprovedSalons(String query) {
        List<Salon> salons = (query != null && !query.isBlank())
                ? salonRepository.searchApproved(query.trim())
                : salonRepository.findByStatus(SalonStatus.APPROVED);
        return salons.stream().map(SalonResponse::from).toList();
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
}
