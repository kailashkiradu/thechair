package com.thechair.bookings.service;

import com.thechair.bookings.dto.BookingRequest;
import com.thechair.bookings.dto.BookingResponse;
import com.thechair.bookings.entity.Booking;
import com.thechair.bookings.entity.TimeSlot;
import com.thechair.users.entity.User;
import com.thechair.bookings.entity.BookingStatus;
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

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        TimeSlot slot = timeSlotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (slot.isBooked()) {
            throw new ConflictException("This slot is already booked");
        }

        if (slot.getStaff() == null) {
            throw new BadRequestException("Time slot is not assigned to a stylist");
        }

        slot.setBooked(true);
        timeSlotRepository.save(slot);

        Booking booking = Booking.builder()
                .customer(customer)
                .salon(slot.getSalon())
                .offering(slot.getOffering())
                .slot(slot)
                .staff(slot.getStaff())
                .customerName(customer.getName())
                .customerPhone(customer.getPhone())
                .bookingType("ONLINE")
                .totalAmount(slot.getOffering().getPrice())
                .notes(request.getNotes())
                .build();

        return BookingResponse.from(bookingRepository.save(booking));
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
        booking.getSlot().setBooked(false);
        timeSlotRepository.save(booking.getSlot());

        return BookingResponse.from(bookingRepository.save(booking));
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

        slot.setBooked(true);
        timeSlotRepository.save(slot);

        Booking booking = Booking.builder()
                .salon(salon)
                .offering(slot.getOffering())
                .slot(slot)
                .staff(slot.getStaff())
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in Guest")
                .customerPhone(request.getCustomerPhone())
                .bookingType("WALK_IN")
                .status(BookingStatus.CONFIRMED)
                .paymentStatus(com.thechair.bookings.entity.PaymentStatus.PENDING)
                .totalAmount(slot.getOffering().getPrice())
                .notes(request.getNotes())
                .build();

        return BookingResponse.from(bookingRepository.save(booking));
    }
}
