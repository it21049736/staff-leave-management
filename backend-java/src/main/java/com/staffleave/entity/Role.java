package com.staffleave.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    ADMIN,
    EMPLOYEE;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static Role fromJson(String value) {
        return Role.valueOf(value.toUpperCase());
    }
}
