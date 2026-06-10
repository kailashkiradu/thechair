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
import com.thechair.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffService {

    private final StaffRepository staffRepository;
    private final SalonRepository salonRepository;
    private final UserRepository userRepository;

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
