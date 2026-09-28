package com.staffleave.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class ReportDtos {

    @Data
    @AllArgsConstructor
    public static class SummaryResponse {
        private Map<String, Long> byStatus;
        private List<ByTypeEntry> byType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ByTypeEntry {
        @JsonProperty("leave_type__name")
        private String leaveTypeName;
        @JsonProperty("total_days")
        private long totalDays;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ByDepartmentEntry {
        @JsonProperty("user__department__name")
        private String departmentName;
        @JsonProperty("total_days")
        private long totalDays;
    }
}
