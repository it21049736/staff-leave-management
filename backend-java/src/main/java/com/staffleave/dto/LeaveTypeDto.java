package com.staffleave.dto;

import com.staffleave.entity.LeaveType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeaveTypeDto {
    private Long id;

    @NotBlank
    private String name;

    private int defaultDays;
    private boolean requiresDocument;

    public static LeaveTypeDto from(LeaveType t) {
        LeaveTypeDto dto = new LeaveTypeDto();
        dto.id = t.getId();
        dto.name = t.getName();
        dto.defaultDays = t.getDefaultDays();
        dto.requiresDocument = t.isRequiresDocument();
        return dto;
    }

    public LeaveType toEntity() {
        LeaveType t = new LeaveType();
        t.setName(name);
        t.setDefaultDays(defaultDays);
        t.setRequiresDocument(requiresDocument);
        return t;
    }
}
