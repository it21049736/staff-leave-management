package com.staffleave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestUpsert {
    @NotNull(message = "Leave type is required.")
    private Long leaveType;
    @NotNull(message = "From date is required.")
    private LocalDate fromDate;
    @NotNull(message = "To date is required.")
    private LocalDate toDate;
    @NotBlank(message = "Please provide a reason for this leave request.")
    @Size(max = 1000, message = "Reason must be 1000 characters or fewer.")
    private String reason;
}
