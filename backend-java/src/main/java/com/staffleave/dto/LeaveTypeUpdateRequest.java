package com.staffleave.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Separate from LeaveTypeDto on purpose: uses wrapper types so a field left out
 *  of the PATCH body is null (leave unchanged) instead of silently coercing to
 *  0 / false the way primitive int/boolean would on a partial JSON payload.
 *  Bean Validation only runs these constraints when the field is actually
 *  present (null is skipped), which is exactly the partial-update semantics
 *  we want here. */
@Data
public class LeaveTypeUpdateRequest {
    @Size(min = 1, max = 40, message = "Name must be between 1 and 40 characters.")
    private String name;

    @Min(value = 0, message = "Default days cannot be negative.")
    @Max(value = 365, message = "Default days cannot exceed 365.")
    private Integer defaultDays;

    private Boolean requiresDocument;
}
