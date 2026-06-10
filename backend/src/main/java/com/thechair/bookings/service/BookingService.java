package com.thechair.bookings.service;

import com.thechair.bookings.dto.BookingRequest;
import com.thechair.bookings.dto.BookingResponse;
import com.thechair.bookings.entity.Booking;
import com.thechair.bookings.entity.TimeSlot;
import com.thechair.users.entity.User;
import com.thechair.bookings.entity.BookingStatus;
import com.thechair.bookings.entity.PaymentStatus;
import com.thechair.bookings.entity.Waitlist;
import com.thechair.bookings.entity.WaitlistStatus;
import com.thechair.bookings.repository.WaitlistRepository;
import com.thechair.common.exception.BadRequestException;
import com.thechair.common.exception.ConflictException;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.bookings.repository.BookingRepository;
import com.thechair.bookings.repository.TimeSlotRepository;
import com.thechair.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thechair.salons.entity.Salon;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.services.entity.SalonOffering;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;
    private final SalonRepository salonRepository;
    private final WaitlistRepository waitlistRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.isRestricted()) {
            throw new BadRequestException("Your account is restricted from online bookings due to multiple no-shows. Please contact the salon.");
        }

        TimeSlot slot = timeSlotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (slot.isBooked()) {
            throw new ConflictException("This slot is already booked");
        }

        if (slot.getStaff() == null) {
            throw new BadRequestException("Time slot is not assigned to a stylist");
        }

        // Calculate total duration we need to block: service duration + buffer time
        int totalRequiredDuration = slot.getOffering().getDuration() +
                (slot.getOffering().getBufferTime() != null ? slot.getOffering().getBufferTime() : 0);

        List<TimeSlot> stylistSlots = timeSlotRepository.findByStaffAndDateOrderByStartTime(slot.getStaff(), slot.getDate());

        int startIndex = -1;
        for (int i = 0; i < stylistSlots.size(); i++) {
            if (stylistSlots.get(i).getId().equals(slot.getId())) {
                startIndex = i;
                break;
            }
        }

        if (startIndex == -1) {
            throw new BadRequestException("Start slot not found in stylist's schedule");
        }

        List<TimeSlot> slotsToBook = new ArrayList<>();
        int accumulatedMinutes = 0;
        int currentIndex = startIndex;

        while (accumulatedMinutes < totalRequiredDuration) {
            if (currentIndex >= stylistSlots.size()) {
                throw new ConflictException("Insufficient consecutive slots to cover the service duration (" + totalRequiredDuration + " mins required)");
            }

            TimeSlot currentSlot = stylistSlots.get(currentIndex);

            if (currentSlot.isBooked()) {
                throw new ConflictException("One or more required consecutive slots are already booked");
            }

            if (!slotsToBook.isEmpty()) {
                TimeSlot previousSlot = slotsToBook.get(slotsToBook.size() - 1);
                if (!currentSlot.getStartTime().equals(previousSlot.getEndTime())) {
                    throw new ConflictException("Gap detected in consecutive time slots. Stylist schedule must be contiguous.");
                }
            }

            slotsToBook.add(currentSlot);
            long slotMinutes = Duration.between(currentSlot.getStartTime(), currentSlot.getEndTime()).toMinutes();
            accumulatedMinutes += slotMinutes;
            currentIndex++;
        }

        Booking booking = Booking.builder()
                .customer(customer)
                .salon(slot.getSalon())
                .offering(slot.getOffering())
                .slot(slot)
                .staff(slot.getStaff())
                .customerName(customer.getName())
                .customerPhone(customer.getPhone())
                .bookingType("ONLINE")
                .status(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PENDING)
                .totalAmount(slot.getOffering().getPrice())
                .notes(request.getNotes())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        for (TimeSlot ts : slotsToBook) {
            ts.setBooked(true);
            ts.setBooking(savedBooking);
            timeSlotRepository.save(ts);
        }

        return BookingResponse.from(savedBooking);
    }

    public List<BookingResponse> getMyBookings(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return bookingRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream().map(BookingResponse::from).toList();
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, String customerEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(customerEmail)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a " + booking.getStatus().name().toLowerCase() + " booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        
        List<TimeSlot> slotsToFree = booking.getConsecutiveSlots();
        if (slotsToFree != null && !slotsToFree.isEmpty()) {
            for (TimeSlot ts : slotsToFree) {
                ts.setBooked(false);
                ts.setBooking(null);
                timeSlotRepository.save(ts);
            }
        } else {
            booking.getSlot().setBooked(false);
            booking.getSlot().setBooking(null);
            timeSlotRepository.save(booking.getSlot());
        }

        Booking saved = bookingRepository.save(booking);

        // Notify waitlist candidates for the freed slot range
        notifyWaitlistForFreedSlots(booking.getSalon(), booking.getOffering(),
                booking.getSlot().getDate(), booking.getSlot().getStartTime(),
                booking.getSlot().getEndTime());

        return BookingResponse.from(saved);
    }

    @Transactional
    public BookingResponse createWalkInBooking(BookingRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        Salon salon = salonRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("No salon registered yet"));

        TimeSlot slot = timeSlotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Slot does not belong to your salon");
        }
        if (slot.isBooked()) {
            throw new ConflictException("Slot is already booked");
        }
        if (slot.getStaff() == null) {
            throw new BadRequestException("Time slot is not assigned to a stylist");
        }

        // Calculate total duration we need to block: service duration + buffer time
        int totalRequiredDuration = slot.getOffering().getDuration() +
                (slot.getOffering().getBufferTime() != null ? slot.getOffering().getBufferTime() : 0);

        List<TimeSlot> stylistSlots = timeSlotRepository.findByStaffAndDateOrderByStartTime(slot.getStaff(), slot.getDate());

        int startIndex = -1;
        for (int i = 0; i < stylistSlots.size(); i++) {
            if (stylistSlots.get(i).getId().equals(slot.getId())) {
                startIndex = i;
                break;
            }
        }

        if (startIndex == -1) {
            throw new BadRequestException("Start slot not found in stylist's schedule");
        }

        List<TimeSlot> slotsToBook = new ArrayList<>();
        int accumulatedMinutes = 0;
        int currentIndex = startIndex;

        while (accumulatedMinutes < totalRequiredDuration) {
            if (currentIndex >= stylistSlots.size()) {
                throw new ConflictException("Insufficient consecutive slots to cover the service duration (" + totalRequiredDuration + " mins required)");
            }

            TimeSlot currentSlot = stylistSlots.get(currentIndex);

            if (currentSlot.isBooked()) {
                throw new ConflictException("One or more required consecutive slots are already booked");
            }

            if (!slotsToBook.isEmpty()) {
                TimeSlot previousSlot = slotsToBook.get(slotsToBook.size() - 1);
                if (!currentSlot.getStartTime().equals(previousSlot.getEndTime())) {
                    throw new ConflictException("Gap detected in consecutive time slots. Stylist schedule must be contiguous.");
                }
            }

            slotsToBook.add(currentSlot);
            long slotMinutes = Duration.between(currentSlot.getStartTime(), currentSlot.getEndTime()).toMinutes();
            accumulatedMinutes += slotMinutes;
            currentIndex++;
        }

        Booking booking = Booking.builder()
                .salon(salon)
                .offering(slot.getOffering())
                .slot(slot)
                .staff(slot.getStaff())
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in Guest")
                .customerPhone(request.getCustomerPhone())
                .bookingType("WALK_IN")
                .status(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PENDING)
                .totalAmount(slot.getOffering().getPrice())
                .notes(request.getNotes())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        for (TimeSlot ts : slotsToBook) {
            ts.setBooked(true);
            ts.setBooking(savedBooking);
            timeSlotRepository.save(ts);
        }

        return BookingResponse.from(savedBooking);
    }

    private void notifyWaitlistForFreedSlots(Salon salon, SalonOffering offering, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Waitlist> pendingList = waitlistRepository.findBySalonAndOfferingAndPreferredDateAndStatus(
                salon, offering, date, WaitlistStatus.PENDING);

        for (Waitlist entry : pendingList) {
            boolean timeMatches = true;
            if (entry.getPreferredTimeStart() != null && entry.getPreferredTimeStart().isAfter(startTime)) {
                timeMatches = false;
            }
            if (entry.getPreferredTimeEnd() != null && entry.getPreferredTimeEnd().isBefore(endTime)) {
                timeMatches = false;
            }

            if (timeMatches) {
                entry.setStatus(WaitlistStatus.NOTIFIED);
                waitlistRepository.save(entry);
                System.out.println("NOTIFY: Waitlist candidate " + entry.getCustomer().getName() +
                        " (email: " + entry.getCustomer().getEmail() + ") notified of freed slot at " + startTime + " on " + date);
            }
        }
    }
}
