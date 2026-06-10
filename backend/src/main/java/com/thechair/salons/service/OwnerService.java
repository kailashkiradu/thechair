package com.thechair.salons.service;

import com.thechair.services.dto.OfferingRequest;
import com.thechair.salons.dto.SalonRequest;
import com.thechair.bookings.dto.SlotGenerateRequest;
import com.thechair.bookings.dto.BookingResponse;
import com.thechair.services.dto.OfferingResponse;
import com.thechair.salons.dto.SalonResponse;
import com.thechair.bookings.dto.SlotResponse;
import com.thechair.bookings.entity.Booking;
import com.thechair.salons.entity.Salon;
import com.thechair.services.entity.SalonOffering;
import com.thechair.bookings.entity.TimeSlot;
import com.thechair.users.entity.User;
import com.thechair.bookings.entity.BookingStatus;
import com.thechair.bookings.entity.BookingStatus;
import com.thechair.common.exception.BadRequestException;
import com.thechair.common.exception.ConflictException;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.bookings.repository.BookingRepository;
import com.thechair.services.repository.SalonOfferingRepository;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.bookings.repository.TimeSlotRepository;
import com.thechair.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.thechair.staff.entity.Staff;
import com.thechair.staff.repository.StaffRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerService {

    private final SalonRepository salonRepository;
    private final SalonOfferingRepository offeringRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;

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
                .status(com.thechair.salons.entity.SalonStatus.APPROVED)
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

        Staff staff = null;
        if (request.getStaffId() != null) {
            staff = staffRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
            if (!staff.getSalon().getId().equals(salon.getId())) {
                throw new BadRequestException("Staff does not belong to your salon");
            }
        }

        List<TimeSlot> slots = new ArrayList<>();
        LocalTime cursor = request.getStartTime();
        int duration = offering.getDuration();

        while (!cursor.plusMinutes(duration).isAfter(request.getEndTime())) {
            LocalTime end = cursor.plusMinutes(duration);
            boolean exists = false;
            if (staff != null) {
                exists = timeSlotRepository.existsByStaffAndDateAndStartTime(staff, request.getDate(), cursor);
            } else {
                exists = timeSlotRepository.existsBySalonAndOfferingAndDateAndStartTime(salon, offering, request.getDate(), cursor);
            }

            if (!exists) {
                slots.add(TimeSlot.builder()
                        .salon(salon)
                        .offering(offering)
                        .staff(staff)
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
