package com.thechair.bookings.service;

import com.thechair.bookings.dto.WaitlistRequest;
import com.thechair.bookings.dto.WaitlistResponse;
import com.thechair.bookings.entity.Waitlist;
import com.thechair.bookings.entity.WaitlistStatus;
import com.thechair.bookings.repository.WaitlistRepository;
import com.thechair.common.exception.BadRequestException;
import com.thechair.common.exception.ConflictException;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.salons.entity.Salon;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.services.entity.SalonOffering;
import com.thechair.services.repository.SalonOfferingRepository;
import com.thechair.users.entity.User;
import com.thechair.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final UserRepository userRepository;
    private final SalonRepository salonRepository;
    private final SalonOfferingRepository salonOfferingRepository;

    @Transactional
    public WaitlistResponse joinWaitlist(WaitlistRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.isRestricted()) {
            throw new BadRequestException("Your account is restricted from online bookings due to multiple no-shows.");
        }

        Salon salon = salonRepository.findById(request.getSalonId())
                .orElseThrow(() -> new ResourceNotFoundException("Salon not found"));

        SalonOffering offering = salonOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Service offering not found"));

        // Check if user is already on the waitlist for this service and date
        List<Waitlist> existing = waitlistRepository.findBySalonAndOfferingAndPreferredDateAndStatus(
                salon, offering, request.getPreferredDate(), WaitlistStatus.PENDING);
        boolean alreadyExists = existing.stream().anyMatch(w -> w.getCustomer().getId().equals(customer.getId()));
        if (alreadyExists) {
            throw new ConflictException("You are already on the waitlist for this service on this date.");
        }

        Waitlist waitlist = Waitlist.builder()
                .customer(customer)
                .salon(salon)
                .offering(offering)
                .preferredDate(request.getPreferredDate())
                .preferredTimeStart(request.getPreferredTimeStart())
                .preferredTimeEnd(request.getPreferredTimeEnd())
                .status(WaitlistStatus.PENDING)
                .build();

        Waitlist saved = waitlistRepository.save(waitlist);
        return WaitlistResponse.from(saved);
    }

    public List<WaitlistResponse> getCustomerWaitlist(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return waitlistRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(WaitlistResponse::from)
                .toList();
    }

    @Transactional
    public void leaveWaitlist(UUID waitlistId, String customerEmail) {
        Waitlist waitlist = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));

        if (!waitlist.getCustomer().getEmail().equals(customerEmail)) {
            throw new BadRequestException("You can only remove your own waitlist entries");
        }

        waitlistRepository.delete(waitlist);
    }

    public List<WaitlistResponse> getOwnerWaitlist(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        Salon salon = salonRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("No salon registered yet"));

        return waitlistRepository.findBySalonIdOrderByCreatedAtDesc(salon.getId())
                .stream()
                .map(WaitlistResponse::from)
                .toList();
    }
}
