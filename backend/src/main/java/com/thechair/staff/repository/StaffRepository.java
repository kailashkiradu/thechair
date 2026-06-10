package com.thechair.staff.repository;

import com.thechair.staff.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {
    List<Staff> findBySalonId(UUID salonId);
    List<Staff> findBySalonIdAndAvailable(UUID salonId, boolean available);
}
