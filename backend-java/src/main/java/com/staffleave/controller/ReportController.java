package com.staffleave.controller;

import com.staffleave.dto.ReportDtos.ByDepartmentEntry;
import com.staffleave.dto.ReportDtos.SummaryResponse;
import com.staffleave.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary/")
    public SummaryResponse summary() {
        return reportService.summary();
    }

    @GetMapping("/by-department/")
    public List<ByDepartmentEntry> byDepartment() {
        return reportService.byDepartment();
    }

    @GetMapping("/export/")
    public ResponseEntity<byte[]> export() {
        byte[] csv = reportService.exportCsv().getBytes();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leave_requests.csv\"")
                .body(csv);
    }
}
