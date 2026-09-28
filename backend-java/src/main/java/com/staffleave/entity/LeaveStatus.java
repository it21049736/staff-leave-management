package com.staffleave.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LeaveStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static LeaveStatus fromJson(String value) {
        return LeaveStatus.valueOf(value.toUpperCase());
    }
}
