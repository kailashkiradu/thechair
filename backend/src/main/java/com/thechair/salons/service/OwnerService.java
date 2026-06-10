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
import com.thechair.staff.entity.StaffLeave;
import com.thechair.staff.repository.StaffLeaveRepository;
import com.thechair.salons.entity.SalonException;
import com.thechair.salons.repository.SalonExceptionRepository;
import com.thechair.salons.dto.SalonExceptionRequest;
import com.thechair.salons.dto.SalonExceptionResponse;
import com.thechair.services.entity.ServicePackage;
import com.thechair.services.repository.ServicePackageRepository;
import com.thechair.services.dto.ServicePackageRequest;
import com.thechair.services.dto.ServicePackageResponse;
import com.thechair.salons.entity.SalonGallery;
import com.thechair.salons.repository.SalonGalleryRepository;
import com.thechair.salons.dto.SalonGalleryRequest;
import com.thechair.salons.dto.SalonGalleryResponse;
import java.util.Optional;

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
    private final StaffLeaveRepository staffLeaveRepository;
    private final SalonExceptionRepository salonExceptionRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final SalonGalleryRepository salonGalleryRepository;

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

        Optional<SalonException> exceptionOpt = salonExceptionRepository.findBySalonIdAndExceptionDate(salon.getId(), request.getDate());
        LocalTime allowedStart = request.getStartTime();
        LocalTime allowedEnd = request.getEndTime();

        if (exceptionOpt.isPresent()) {
            SalonException exc = exceptionOpt.get();
            if (exc.isClosed()) {
                throw new BadRequestException("Salon is closed on this date: " + exc.getReason());
            }
            if (exc.getOpenTime() != null && exc.getOpenTime().isAfter(allowedStart)) {
                allowedStart = exc.getOpenTime();
            }
            if (exc.getCloseTime() != null && exc.getCloseTime().isBefore(allowedEnd)) {
                allowedEnd = exc.getCloseTime();
            }
        }

        List<TimeSlot> slots = new ArrayList<>();
        LocalTime cursor = allowedStart;
        int duration = offering.getDuration();

        List<StaffLeave> leaves = (staff != null)
                ? staffLeaveRepository.findByStaffIdAndLeaveDate(staff.getId(), request.getDate())
                : List.of();

        while (!cursor.plusMinutes(duration).isAfter(allowedEnd)) {
            LocalTime end = cursor.plusMinutes(duration);

            boolean onLeave = false;
            for (StaffLeave leave : leaves) {
                if (leave.getStartTime() == null || leave.getEndTime() == null) {
                    onLeave = true;
                    break;
                } else {
                    if (cursor.isBefore(leave.getEndTime()) && end.isAfter(leave.getStartTime())) {
                        onLeave = true;
                        break;
                    }
                }
            }

            if (onLeave) {
                cursor = end;
                continue;
            }

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

    @Transactional
    public SalonExceptionResponse addSalonException(SalonExceptionRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        LocalDate date = request.getExceptionDate();

        List<Booking> bookings = bookingRepository.findBySalonAndSlotDate(salon, date);

        for (Booking booking : bookings) {
            if (booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.CONFIRMED) {
                if (request.isClosed()) {
                    throw new ConflictException("Cannot apply exception. There is an active booking on " + date +
                            " for customer: " + booking.getCustomerName() + ". Please reschedule or cancel the booking first.");
                }
                LocalTime slotStart = booking.getSlot().getStartTime();
                LocalTime slotEnd = booking.getSlot().getEndTime();
                if (request.getOpenTime() != null && slotStart.isBefore(request.getOpenTime())) {
                    throw new ConflictException("Cannot apply exception. There is an active booking on " + date +
                            " at " + slotStart + " which is before the new opening time: " + request.getOpenTime() +
                            ". Please reschedule or cancel the booking first.");
                }
                if (request.getCloseTime() != null && slotEnd.isAfter(request.getCloseTime())) {
                    throw new ConflictException("Cannot apply exception. There is an active booking on " + date +
                            " at " + slotStart + " which ends after the new closing time: " + request.getCloseTime() +
                            ". Please reschedule or cancel the booking first.");
                }
            }
        }

        Optional<SalonException> existingOpt = salonExceptionRepository.findBySalonIdAndExceptionDate(salon.getId(), date);
        SalonException exception;
        if (existingOpt.isPresent()) {
            exception = existingOpt.get();
            exception.setClosed(request.isClosed());
            exception.setOpenTime(request.getOpenTime());
            exception.setCloseTime(request.getCloseTime());
            exception.setReason(request.getReason());
        } else {
            exception = SalonException.builder()
                    .salon(salon)
                    .exceptionDate(date)
                    .isClosed(request.isClosed())
                    .openTime(request.getOpenTime())
                    .closeTime(request.getCloseTime())
                    .reason(request.getReason())
                    .build();
        }
        SalonException saved = salonExceptionRepository.save(exception);

        List<TimeSlot> slots = timeSlotRepository.findBySalonAndDateOrderByStartTime(salon, date);
        for (TimeSlot slot : slots) {
            if (!slot.isBooked()) {
                boolean deletes = false;
                if (request.isClosed()) {
                    deletes = true;
                } else {
                    if (request.getOpenTime() != null && slot.getStartTime().isBefore(request.getOpenTime())) {
                        deletes = true;
                    }
                    if (request.getCloseTime() != null && slot.getEndTime().isAfter(request.getCloseTime())) {
                        deletes = true;
                    }
                }
                if (deletes) {
                    timeSlotRepository.delete(slot);
                }
            }
        }

        return SalonExceptionResponse.from(saved);
    }

    public List<SalonExceptionResponse> getSalonExceptions(String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        return salonExceptionRepository.findBySalonId(salon.getId()).stream()
                .map(SalonExceptionResponse::from)
                .toList();
    }

    @Transactional
    public void deleteSalonException(UUID exceptionId, String ownerEmail) {
        SalonException exception = salonExceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Salon exception not found"));
        if (!exception.getSalon().getOwner().getEmail().equals(ownerEmail)) {
            throw new BadRequestException("Exception does not belong to your salon");
        }
        salonExceptionRepository.delete(exception);
    }

    @Transactional
    public ServicePackageResponse addServicePackage(ServicePackageRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);

        List<SalonOffering> offerings = offeringRepository.findAllById(request.getOfferingIds());
        if (offerings.size() != request.getOfferingIds().size()) {
            throw new ResourceNotFoundException("One or more service offerings not found");
        }
        for (SalonOffering offering : offerings) {
            if (!offering.getSalon().getId().equals(salon.getId())) {
                throw new BadRequestException("Service " + offering.getName() + " does not belong to your salon");
            }
        }

        int totalDuration = offerings.stream().mapToInt(SalonOffering::getDuration).sum();

        ServicePackage servicePackage = ServicePackage.builder()
                .salon(salon)
                .name(request.getName())
                .description(request.getDescription())
                .duration(totalDuration)
                .price(request.getPrice())
                .offerings(offerings)
                .build();

        return ServicePackageResponse.from(servicePackageRepository.save(servicePackage));
    }

    @Transactional
    public ServicePackageResponse updateServicePackage(UUID packageId, ServicePackageRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        ServicePackage servicePackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo package not found"));

        if (!servicePackage.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Combo package does not belong to your salon");
        }

        List<SalonOffering> offerings = offeringRepository.findAllById(request.getOfferingIds());
        if (offerings.size() != request.getOfferingIds().size()) {
            throw new ResourceNotFoundException("One or more service offerings not found");
        }
        for (SalonOffering offering : offerings) {
            if (!offering.getSalon().getId().equals(salon.getId())) {
                throw new BadRequestException("Service " + offering.getName() + " does not belong to your salon");
            }
        }

        int totalDuration = offerings.stream().mapToInt(SalonOffering::getDuration).sum();

        servicePackage.setName(request.getName());
        servicePackage.setDescription(request.getDescription());
        servicePackage.setDuration(totalDuration);
        servicePackage.setPrice(request.getPrice());
        servicePackage.setOfferings(offerings);

        return ServicePackageResponse.from(servicePackageRepository.save(servicePackage));
    }

    public List<ServicePackageResponse> getServicePackages(String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        return servicePackageRepository.findBySalon(salon).stream()
                .filter(ServicePackage::isActive)
                .map(ServicePackageResponse::from)
                .toList();
    }

    @Transactional
    public void deleteServicePackage(UUID packageId, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        ServicePackage servicePackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo package not found"));

        if (!servicePackage.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Combo package does not belong to your salon");
        }

        servicePackage.setActive(false);
        servicePackageRepository.save(servicePackage);
    }

    @Transactional
    public SalonGalleryResponse addGalleryItem(SalonGalleryRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        SalonGallery item = SalonGallery.builder()
                .salon(salon)
                .imageUrl(request.getImageUrl())
                .imageType(request.getImageType())
                .description(request.getDescription())
                .build();
        return SalonGalleryResponse.from(salonGalleryRepository.save(item));
    }

    public List<SalonGalleryResponse> getGalleryItems(String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        return salonGalleryRepository.findBySalonId(salon.getId()).stream()
                .map(SalonGalleryResponse::from)
                .toList();
    }

    @Transactional
    public void deleteGalleryItem(UUID itemId, String ownerEmail) {
        SalonGallery item = salonGalleryRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found"));
        if (!item.getSalon().getOwner().getEmail().equals(ownerEmail)) {
            throw new BadRequestException("Gallery item does not belong to your salon");
        }
        salonGalleryRepository.delete(item);
    }
}
