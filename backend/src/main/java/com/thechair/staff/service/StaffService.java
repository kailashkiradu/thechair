package com.thechair.staff.service;

import com.thechair.salons.entity.Salon;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.staff.dto.StaffRequest;
import com.thechair.staff.dto.StaffResponse;
import com.thechair.staff.entity.Staff;
import com.thechair.staff.repository.StaffRepository;
import com.thechair.users.entity.User;
import com.thechair.users.repository.UserRepository;
import com.thechair.common.exception.BadRequestException;
import com.thechair.common.exception.ConflictException;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.staff.dto.StaffLeaveRequest;
import com.thechair.staff.dto.StaffLeaveResponse;
import com.thechair.staff.entity.StaffLeave;
import com.thechair.staff.repository.StaffLeaveRepository;
import com.thechair.bookings.entity.TimeSlot;
import com.thechair.bookings.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffService {

    private final StaffRepository staffRepository;
    private final SalonRepository salonRepository;
    private final UserRepository userRepository;
    private final StaffLeaveRepository staffLeaveRepository;
    private final TimeSlotRepository timeSlotRepository;

    public List<StaffResponse> getStaffBySalonId(UUID salonId) {
        return staffRepository.findBySalonId(salonId).stream()
                .map(StaffResponse::from)
                .toList();
    }

    public List<StaffResponse> getStaffForOwner(String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        return staffRepository.findBySalonId(salon.getId()).stream()
                .map(StaffResponse::from)
                .toList();
    }

    @Transactional
    public StaffResponse addStaff(StaffRequest request, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        Staff staff = Staff.builder()
                .salon(salon)
                .name(request.getName())
                .specialty(request.getSpecialty())
                .photoUrl(request.getPhotoUrl())
                .experienceYears(request.getExperienceYears())
                .build();
        return StaffResponse.from(staffRepository.save(staff));
    }

    @Transactional
    public StaffResponse updateStaff(UUID staffId, StaffRequest request, String ownerEmail) {
        Staff staff = getOwnedStaff(staffId, ownerEmail);
        staff.setName(request.getName());
        staff.setSpecialty(request.getSpecialty());
        staff.setPhotoUrl(request.getPhotoUrl());
        staff.setExperienceYears(request.getExperienceYears());
        return StaffResponse.from(staffRepository.save(staff));
    }

    @Transactional
    public StaffResponse toggleAvailability(UUID staffId, String ownerEmail) {
        Staff staff = getOwnedStaff(staffId, ownerEmail);
        staff.setAvailable(!staff.isAvailable());
        return StaffResponse.from(staffRepository.save(staff));
    }

    @Transactional
    public void deleteStaff(UUID staffId, String ownerEmail) {
        Staff staff = getOwnedStaff(staffId, ownerEmail);
        staffRepository.delete(staff);
    }

    private Salon getOwnedSalon(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        return salonRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("No salon registered yet"));
    }

    @Transactional
    public StaffLeaveResponse addStaffLeave(UUID staffId, StaffLeaveRequest request, String ownerEmail) {
        Staff staff = getOwnedStaff(staffId, ownerEmail);

        LocalDate date = request.getLeaveDate();
        LocalTime start = request.getStartTime();
        LocalTime end = request.getEndTime();

        // 1. Fetch slots for this stylist on this date
        List<TimeSlot> slots = timeSlotRepository.findByStaffAndDate(staff, date);

        // 2. Identify if any slots fall into the leave period, and check if they are already booked
        for (TimeSlot slot : slots) {
            boolean overlaps = false;
            if (start == null || end == null) {
                // Full day leave overlaps with all slots on that date
                overlaps = true;
            } else {
                // Partial day leave: slot overlaps if [slot.startTime, slot.endTime] intersects with [start, end]
                overlaps = slot.getStartTime().isBefore(end) && slot.getEndTime().isAfter(start);
            }

            if (overlaps) {
                if (slot.isBooked()) {
                    throw new ConflictException("Cannot log leave. Stylist has active bookings on " + date + 
                            (start != null ? " between " + start + " and " + end : " (Full Day)") + 
                            ". Please reschedule or cancel the bookings first.");
                }
            }
        }

        // 3. Save the leave
        StaffLeave leave = StaffLeave.builder()
                .staff(staff)
                .leaveDate(date)
                .startTime(start)
                .endTime(end)
                .reason(request.getReason())
                .build();
        StaffLeave saved = staffLeaveRepository.save(leave);

        // 4. Delete unbooked slots that overlap with this leave
        for (TimeSlot slot : slots) {
            boolean overlaps = false;
            if (start == null || end == null) {
                overlaps = true;
            } else {
                overlaps = slot.getStartTime().isBefore(end) && slot.getEndTime().isAfter(start);
            }
            if (overlaps && !slot.isBooked()) {
                timeSlotRepository.delete(slot);
            }
        }

        return StaffLeaveResponse.from(saved);
    }

    public List<StaffLeaveResponse> getStaffLeaves(UUID staffId, String ownerEmail) {
        Staff staff = getOwnedStaff(staffId, ownerEmail);
        return staffLeaveRepository.findByStaffId(staff.getId()).stream()
                .map(StaffLeaveResponse::from)
                .toList();
    }

    @Transactional
    public void deleteStaffLeave(UUID leaveId, String ownerEmail) {
        StaffLeave leave = staffLeaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff leave not found"));
        // Ensure owner owns the staff member linked to this leave
        getOwnedStaff(leave.getStaff().getId(), ownerEmail);
        staffLeaveRepository.delete(leave);
    }

    private Staff getOwnedStaff(UUID staffId, String ownerEmail) {
        Salon salon = getOwnedSalon(ownerEmail);
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        if (!staff.getSalon().getId().equals(salon.getId())) {
            throw new BadRequestException("Staff member does not belong to your salon");
        }
        return staff;
    }
}
