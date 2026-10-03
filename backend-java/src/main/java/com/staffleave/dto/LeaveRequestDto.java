package com.staffleave.dto;

import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    private Long id;
    private Long user;
    private String userName;
    private String avatarUrl;
    private String departmentName;
    private String designation;
    private Long leaveType;
    private String leaveTypeName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private int days;
    private String reason;
    private LeaveStatus status;
    private LocalDate appliedOn;
    private Long reviewedBy;
    private String reviewedByName;
    private LocalDate reviewedOn;
    private String remarks;

    // Real, computed balance context (not fabricated) - same fields the
    // Review Requests / Dashboard pages already render on the frontend.
    private Integer balanceEntitled;
    private Integer balanceUsed;

    public static LeaveRequestDto from(LeaveRequest r) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.id = r.getId();
        dto.user = r.getUser().getId();
        dto.userName = r.getUser().getFullName();
        dto.avatarUrl = AvatarUrl.from(r.getUser().getAvatarPath());
        dto.departmentName = r.getUser().getDepartment() != null ? r.getUser().getDepartment().getName() : null;
        dto.designation = r.getUser().getDesignation();
        dto.leaveType = r.getLeaveType().getId();
        dto.leaveTypeName = r.getLeaveType().getName();
        dto.fromDate = r.getFromDate();
        dto.toDate = r.getToDate();
        dto.days = r.getDays();
        dto.reason = r.getReason();
        dto.status = r.getStatus();
        dto.appliedOn = r.getAppliedOn();
        dto.reviewedBy = r.getReviewedBy() != null ? r.getReviewedBy().getId() : null;
        dto.reviewedByName = r.getReviewedBy() != null ? r.getReviewedBy().getFullName() : null;
        dto.reviewedOn = r.getReviewedOn();
        dto.remarks = r.getRemarks();
        return dto;
    }
}
