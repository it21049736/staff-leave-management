package com.staffleave.controller;

import com.staffleave.dto.LeaveRequestDto;
import com.staffleave.dto.LeaveRequestUpsert;
import com.staffleave.dto.PagedResponse;
import com.staffleave.dto.ReviewRequest;
import com.staffleave.entity.LeaveBalance;
import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import com.staffleave.entity.User;
import com.staffleave.repository.LeaveBalanceRepository;
import com.staffleave.security.CurrentUser;
import com.staffleave.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveService leaveService;
    private final CurrentUser currentUser;
    private final LeaveBalanceRepository leaveBalanceRepository;

    /** Maps the entity to its DTO and fills in the real, currently-held balance
     *  context for that leave type/year (mirrors the Django serializer fields
     *  the Dashboard / Review Requests pages already render). */
    private LeaveRequestDto toDto(LeaveRequest r) {
        LeaveRequestDto dto = LeaveRequestDto.from(r);
        if (r.getLeaveType().getDefaultDays() > 0) {
            leaveBalanceRepository
                    .findByUserAndLeaveTypeAndYear(r.getUser(), r.getLeaveType(), r.getFromDate().getYear())
                    .ifPresentOrElse(
                            b -> {
                                dto.setBalanceEntitled(b.getEntitledDays());
                                dto.setBalanceUsed(b.getUsedDays());
                            },
                            () -> {
                                dto.setBalanceEntitled(r.getLeaveType().getDefaultDays());
                                dto.setBalanceUsed(0);
                            });
        }
        return dto;
    }

    @GetMapping("/")
    public List<LeaveRequestDto> myLeaves(Authentication authentication,
                                           @RequestParam(required = false) String status) {
        User user = currentUser.get(authentication);
        List<LeaveRequest> all = leaveService.myLeaves(user);
        return all.stream()
                .filter(r -> status == null || status.isBlank() || r.getStatus() == LeaveStatus.valueOf(status.toUpperCase()))
                .map(this::toDto)
                .toList();
    }

    @PostMapping("/")
    public LeaveRequestDto apply(Authentication authentication, @Valid @RequestBody LeaveRequestUpsert req) {
        return toDto(leaveService.apply(currentUser.get(authentication), req));
    }

    @PatchMapping("/{id}/")
    public LeaveRequestDto update(Authentication authentication, @PathVariable Long id,
                                   @Valid @RequestBody LeaveRequestUpsert req) {
        return toDto(leaveService.updatePending(currentUser.get(authentication), id, req));
    }

    @PostMapping("/{id}/cancel/")
    public LeaveRequestDto cancel(Authentication authentication, @PathVariable Long id) {
        return toDto(leaveService.cancel(currentUser.get(authentication), id));
    }

    @GetMapping("/all/")
    @PreAuthorize("hasRole('ADMIN')")
    public PagedResponse<LeaveRequestDto> all(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long dept,
            @RequestParam(name = "leave_type", required = false) Long leaveType,
            @RequestParam(name = "from_date", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "to_date", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "20") int pageSize) {

        int cappedPageSize = Math.min(Math.max(pageSize, 1), 200);
        var result = leaveService.search(status, dept, leaveType, fromDate, toDate, q, null, page, cappedPageSize);
        var dtos = result.getContent().stream().map(this::toDto).toList();
        return new PagedResponse<>(result.getTotalElements(), dtos);
    }

    @PostMapping("/{id}/approve/")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveRequestDto approve(Authentication authentication, @PathVariable Long id,
                                    @Valid @RequestBody(required = false) ReviewRequest req) {
        String remarks = req != null ? req.getRemarks() : "";
        return toDto(leaveService.approve(currentUser.get(authentication), id, remarks));
    }

    @PostMapping("/{id}/reject/")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveRequestDto reject(Authentication authentication, @PathVariable Long id,
                                   @Valid @RequestBody(required = false) ReviewRequest req) {
        String remarks = req != null ? req.getRemarks() : "";
        return toDto(leaveService.reject(currentUser.get(authentication), id, remarks));
    }
}
