package com.staffleave.service;

import com.staffleave.dto.ReportDtos.ByDepartmentEntry;
import com.staffleave.dto.ReportDtos.ByTypeEntry;
import com.staffleave.dto.ReportDtos.SummaryResponse;
import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import com.staffleave.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final LeaveRequestRepository leaveRequestRepository;

    public SummaryResponse summary() {
        List<LeaveRequest> all = leaveRequestRepository.findAll();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (LeaveStatus status : LeaveStatus.values()) {
            byStatus.put(status.name().toLowerCase(), all.stream().filter(r -> r.getStatus() == status).count());
        }

        List<ByTypeEntry> byType = all.stream()
                .filter(r -> r.getStatus() == LeaveStatus.APPROVED)
                .collect(Collectors.groupingBy(r -> r.getLeaveType().getName(),
                        Collectors.summingLong(LeaveRequest::getDays)))
                .entrySet().stream()
                .map(e -> new ByTypeEntry(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getTotalDays(), a.getTotalDays()))
                .toList();

        return new SummaryResponse(byStatus, byType);
    }

    public List<ByDepartmentEntry> byDepartment() {
        List<LeaveRequest> approved = leaveRequestRepository.findAll().stream()
                .filter(r -> r.getStatus() == LeaveStatus.APPROVED)
                .toList();

        return approved.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getUser().getDepartment() != null ? r.getUser().getDepartment().getName() : "Unassigned",
                        Collectors.summingLong(LeaveRequest::getDays)))
                .entrySet().stream()
                .map(e -> new ByDepartmentEntry(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getTotalDays(), a.getTotalDays()))
                .toList();
    }

    public String exportCsv() {
        StringBuilder sb = new StringBuilder("Employee,Department,Leave Type,From,To,Days,Status,Applied On\n");
        for (LeaveRequest r : leaveRequestRepository.findAll()) {
            sb.append(csv(r.getUser().getFullName())).append(',')
              .append(csv(r.getUser().getDepartment() != null ? r.getUser().getDepartment().getName() : "")).append(',')
              .append(csv(r.getLeaveType().getName())).append(',')
              .append(r.getFromDate()).append(',')
              .append(r.getToDate()).append(',')
              .append(r.getDays()).append(',')
              .append(r.getStatus().name().toLowerCase()).append(',')
              .append(r.getAppliedOn()).append('\n');
        }
        return sb.toString();
    }

    private String csv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
