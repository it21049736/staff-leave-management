package com.staffleave.dto;

import jakarta.validation.constraints.NotBlank;
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
    @NotBlank(message = "Please provide a reason for this leave request.")
    private String reason;
}
