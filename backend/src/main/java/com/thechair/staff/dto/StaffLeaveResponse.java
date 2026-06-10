package com.thechair.staff.dto;

import com.thechair.staff.entity.StaffLeave;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffLeaveResponse {

    private UUID id;
    private UUID staffId;
    private String staffName;
    private LocalDate leaveDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private LocalDateTime createdAt;

    public static StaffLeaveResponse from(StaffLeave leave) {
        return StaffLeaveResponse.builder()
                .id(leave.getId())
                .staffId(leave.getStaff().getId())
                .staffName(leave.getStaff().getName())
                .leaveDate(leave.getLeaveDate())
                .startTime(leave.getStartTime())
                .endTime(leave.getEndTime())
                .reason(leave.getReason())
                .createdAt(leave.getCreatedAt())
                .build();
    }
}
