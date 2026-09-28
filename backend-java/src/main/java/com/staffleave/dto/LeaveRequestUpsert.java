package com.staffleave.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestUpsert {
    @NotNull
    private Long leaveType;
    @NotNull
    private LocalDate fromDate;
    @NotNull
    private LocalDate toDate;
    private String reason;
}
