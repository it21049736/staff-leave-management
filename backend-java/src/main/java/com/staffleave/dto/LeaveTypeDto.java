package com.staffleave.dto;

import com.staffleave.entity.LeaveType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeaveTypeDto {
    private Long id;

    @NotBlank(message = "Name is required.")
    @Size(max = 40, message = "Name must be 40 characters or fewer.")
    private String name;

    @Min(value = 0, message = "Default days cannot be negative.")
    @Max(value = 365, message = "Default days cannot exceed 365.")
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
