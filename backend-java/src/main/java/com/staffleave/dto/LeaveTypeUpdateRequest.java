package com.staffleave.dto;

import lombok.Data;

/** Separate from LeaveTypeDto on purpose: uses wrapper types so a field left out
 *  of the PATCH body is null (leave unchanged) instead of silently coercing to
 *  0 / false the way primitive int/boolean would on a partial JSON payload. */
@Data
public class LeaveTypeUpdateRequest {
    private String name;
    private Integer defaultDays;
    private Boolean requiresDocument;
}
