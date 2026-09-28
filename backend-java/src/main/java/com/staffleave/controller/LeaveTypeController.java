package com.staffleave.controller;

import com.staffleave.dto.LeaveTypeDto;
import com.staffleave.entity.LeaveType;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.LeaveRequestRepository;
import com.staffleave.repository.LeaveTypeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/leave-types")
@RequiredArgsConstructor
public class LeaveTypeController {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @GetMapping("/")
    public List<LeaveTypeDto> list() {
        return leaveTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> t.getName().toLowerCase()))
                .map(LeaveTypeDto::from)
                .toList();
    }

    @PostMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveTypeDto create(@Valid @RequestBody LeaveTypeDto req) {
        LeaveType saved = leaveTypeRepository.save(req.toEntity());
        return LeaveTypeDto.from(saved);
    }

    @PatchMapping("/{id}/")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveTypeDto update(@PathVariable Long id, @RequestBody LeaveTypeDto req) {
        LeaveType existing = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Leave type not found."));
        if (req.getName() != null) existing.setName(req.getName());
        existing.setDefaultDays(req.getDefaultDays());
        existing.setRequiresDocument(req.isRequiresDocument());
        return LeaveTypeDto.from(leaveTypeRepository.save(existing));
    }

    @DeleteMapping("/{id}/")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        LeaveType existing = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Leave type not found."));
        if (leaveRequestRepository.count((root, query, cb) -> cb.equal(root.get("leaveType"), existing)) > 0) {
            throw new BusinessRuleException("This leave type is used by existing leave requests and cannot be deleted.");
        }
        leaveTypeRepository.delete(existing);
    }
}
