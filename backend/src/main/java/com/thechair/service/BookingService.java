package com.thechair.service;

import com.thechair.dto.request.BookingRequest;
import com.thechair.dto.response.BookingResponse;
import com.thechair.entity.Booking;
import com.thechair.entity.TimeSlot;
import com.thechair.entity.User;
import com.thechair.enums.BookingStatus;
import com.thechair.exception.BadRequestException;
import com.thechair.exception.ConflictException;
import com.thechair.exception.ResourceNotFoundException;
import com.thechair.repository.BookingRepository;
import com.thechair.repository.TimeSlotRepository;
import com.thechair.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        TimeSlot slot = timeSlotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (slot.isBooked()) {
            throw new ConflictException("This slot is already booked");
        }

        slot.setBooked(true);
        timeSlotRepository.save(slot);

        Booking booking = Booking.builder()
                .customer(customer)
                .salon(slot.getSalon())
                .offering(slot.getOffering())
                .slot(slot)
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
}
