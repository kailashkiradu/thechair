package com.thechair.staff.repository;

import com.thechair.staff.entity.Staff;
import com.thechair.staff.entity.StaffLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StaffLeaveRepository extends JpaRepository<StaffLeave, UUID> {
    List<StaffLeave> findByStaffId(UUID staffId);
    List<StaffLeave> findByStaffIdAndLeaveDate(UUID staffId, LocalDate leaveDate);
    List<StaffLeave> findByStaffInAndLeaveDate(List<Staff> staff, LocalDate leaveDate);
}
