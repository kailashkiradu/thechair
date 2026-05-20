package com.thechair.service;

import com.thechair.dto.response.OfferingResponse;
import com.thechair.dto.response.SalonResponse;
import com.thechair.dto.response.SlotResponse;
import com.thechair.entity.Salon;
import com.thechair.entity.SalonOffering;
import com.thechair.enums.SalonStatus;
import com.thechair.exception.ResourceNotFoundException;
import com.thechair.repository.SalonOfferingRepository;
import com.thechair.repository.SalonRepository;
import com.thechair.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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
