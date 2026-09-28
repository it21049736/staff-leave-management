package com.staffleave.dto;

import com.staffleave.entity.LeaveBalance;
import lombok.Data;

@Data
public class LeaveBalanceDto {
    private Long id;
    private Long leaveType;
    private String leaveTypeName;
    private int year;
    private int entitledDays;
    private int usedDays;
    private int remaining;

    public static LeaveBalanceDto from(LeaveBalance b) {
        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.id = b.getId();
        dto.leaveType = b.getLeaveType().getId();
        dto.leaveTypeName = b.getLeaveType().getName();
        dto.year = b.getYear();
        dto.entitledDays = b.getEntitledDays();
        dto.usedDays = b.getUsedDays();
        dto.remaining = b.getRemaining();
        return dto;
    }
}
