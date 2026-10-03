package com.staffleave.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {
    @Size(max = 1000, message = "Remarks must be 1000 characters or fewer.")
    private String remarks = "";
}
