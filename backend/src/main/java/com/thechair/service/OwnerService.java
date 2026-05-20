package com.thechair.service;

import com.thechair.dto.request.OfferingRequest;
import com.thechair.dto.request.SalonRequest;
import com.thechair.dto.request.SlotGenerateRequest;
import com.thechair.dto.response.BookingResponse;
import com.thechair.dto.response.OfferingResponse;
import com.thechair.dto.response.SalonResponse;
import com.thechair.dto.response.SlotResponse;
import com.thechair.entity.*;
import com.thechair.enums.BookingStatus;
import com.thechair.exception.BadRequestException;
import com.thechair.exception.ConflictException;
import com.thechair.exception.ResourceNotFoundException;
import com.thechair.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OwnerService {

    private final SalonRepository salonRepository;
    private final SalonOfferingRepository offeringRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public SalonResponse getMySalon(String ownerEmail) {
        User owner = getOwner(ownerEmail);
        Salon salon = salonRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("No salon registered yet"));
        return SalonResponse.from(salon);
    }

    @Transactional
    public SalonResponse createSalon(SalonRequest request, String ownerEmail) {
        User owner = getOwner(ownerEmail);
        if (salonRepository.existsByOwner(owner)) {
            throw new ConflictException("You already have a registered salon");
        }
        Salon salon = Salon.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .phone(request.getPhone())
                .email(request.getEmail())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .owner(owner)
                .build();
        return SalonResponse.from(salonRepository.save(salon));
    }

    @Transactional
    public SalonResponse updateSalon(SalonRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        salon.setName(request.getName());
        salon.setDescription(request.getDescription());
        salon.setAddress(request.getAddress());
        salon.setCity(request.getCity());
        salon.setPhone(request.getPhone());
        salon.setEmail(request.getEmail());
        salon.setCategory(request.getCategory());
        if (request.getImageUrl() != null) salon.setImageUrl(request.getImageUrl());
        return SalonResponse.from(salonRepository.save(salon));
    }

    public List<OfferingResponse> getOfferings(String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        return offeringRepository.findBySalon(salon).stream().map(OfferingResponse::from).toList();
    }

    @Transactional
    public OfferingResponse addOffering(OfferingRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        SalonOffering offering = SalonOffering.builder()
                .salon(salon)
                .name(request.getName())
                .description(request.getDescription())
                .duration(request.getDuration())
                .price(request.getPrice())
                .build();
        return OfferingResponse.from(offeringRepository.save(offering));
    }

    @Transactional
    public OfferingResponse updateOffering(UUID offeringId, OfferingRequest request, String ownerEmail) {
        SalonOffering offering = getOwnedOffering(offeringId, ownerEmail);
        offering.setName(request.getName());
        offering.setDescription(request.getDescription());
        offering.setDuration(request.getDuration());
        offering.setPrice(request.getPrice());
        return OfferingResponse.from(offeringRepository.save(offering));
    }

    @Transactional
    public void deleteOffering(UUID offeringId, String ownerEmail) {
        SalonOffering offering = getOwnedOffering(offeringId, ownerEmail);
        offering.setActive(false);
        offeringRepository.save(offering);
    }

    @Transactional
    public List<SlotResponse> generateSlots(SlotGenerateRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        SalonOffering offering = offeringRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!offering.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Service does not belong to your salon");
        }
        if (request.getDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot generate slots for past dates");
        }

        List<TimeSlot> slots = new ArrayList<>();
        LocalTime cursor = request.getStartTime();
        int duration = offering.getDuration();

        while (!cursor.plusMinutes(duration).isAfter(request.getEndTime())) {
            LocalTime end = cursor.plusMinutes(duration);
            if (!timeSlotRepository.existsBySalonAndOfferingAndDateAndStartTime(salon, offering, request.getDate(), cursor)) {
                slots.add(TimeSlot.builder()
                        .salon(salon)
                        .offering(offering)
                        .date(request.getDate())
                        .startTime(cursor)
                        .endTime(end)
                        .build());
            }
            cursor = end;
        }

        return timeSlotRepository.saveAll(slots).stream().map(SlotResponse::from).toList();
    }

    public List<SlotResponse> getSlots(String ownerEmail, LocalDate date) {
        Salon salon = getOwnedSalon(ownerEmail);
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return timeSlotRepository.findBySalonAndDateOrderByStartTime(salon, targetDate)
                .stream().map(SlotResponse::from).toList();
    }

    public List<BookingResponse> getBookings(String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        return bookingRepository.findBySalonOrderByCreatedAtDesc(salon)
                .stream().map(BookingResponse::from).toList();
    }

    @Transactional
    public BookingResponse updateBookingStatus(UUID bookingId, String status, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Booking does not belong to your salon");
        }
        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        return BookingResponse.from(bookingRepository.save(booking));
    }

    private User getOwner(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
    }

    private Salon getOwnedSalon(String ownerEmail) {
        User owner = getOwner(ownerEmail);
        return salonRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("No salon registered yet"));
    }

    private SalonOffering getOwnedOffering(UUID offeringId, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        SalonOffering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        if (!offering.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Service does not belong to your salon");
        }
        return offering;
    }
}
