package com.staffleave.service;

import com.staffleave.dto.LeaveRequestUpsert;
import com.staffleave.entity.*;
import com.staffleave.event.LeaveStatusChangedEvent;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.*;
import com.staffleave.service.validation.LeaveValidationStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final List<LeaveValidationStrategy> validationStrategies; // Strategy pattern - all rules auto-wired
    private final ApplicationEventPublisher eventPublisher; // Observer pattern

    public List<LeaveRequest> myLeaves(User user) {
        return leaveRequestRepository.findByUserOrderByAppliedOnDescIdDesc(user);
    }

    public Page<LeaveRequest> search(String status, Long departmentId, Long leaveTypeId,
                                      LocalDate fromDate, LocalDate toDate, String q,
                                      Long onlyUserId, int page, int pageSize) {
        var spec = LeaveRequestSpecifications.withFilters(status, departmentId, leaveTypeId, fromDate, toDate, q, onlyUserId);
        return leaveRequestRepository.findAll(spec, PageRequest.of(Math.max(0, page - 1), pageSize));
    }

    @Transactional
    public LeaveRequest apply(User user, LeaveRequestUpsert req) {
        LeaveType type = leaveTypeRepository.findById(req.getLeaveType())
                .orElseThrow(() -> new BusinessRuleException("Leave type not found."));

        LeaveRequest candidate = new LeaveRequest();
        candidate.setUser(user);
        candidate.setLeaveType(type);
        candidate.setFromDate(req.getFromDate());
        candidate.setToDate(req.getToDate());
        candidate.setReason(req.getReason());
        candidate.setDays((int) (ChronoUnit.DAYS.between(req.getFromDate(), req.getToDate()) + 1));

        runValidation(candidate, null);

        return leaveRequestRepository.save(candidate);
    }

    @Transactional
    public LeaveRequest updatePending(User requester, Long id, LeaveRequestUpsert req) {
        LeaveRequest existing = getOrThrow(id);
        if (!existing.getUser().getId().equals(requester.getId()) || existing.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessRuleException("Only your own pending request can be updated.");
        }
        LeaveType type = leaveTypeRepository.findById(req.getLeaveType())
                .orElseThrow(() -> new BusinessRuleException("Leave type not found."));

        existing.setLeaveType(type);
        existing.setFromDate(req.getFromDate());
        existing.setToDate(req.getToDate());
        existing.setReason(req.getReason());
        existing.setDays((int) (ChronoUnit.DAYS.between(req.getFromDate(), req.getToDate()) + 1));

        runValidation(existing, id);
        return leaveRequestRepository.save(existing);
    }

    @Transactional
    public LeaveRequest cancel(User requester, Long id) {
        LeaveRequest existing = getOrThrow(id);
        if (!existing.getUser().getId().equals(requester.getId()) || existing.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessRuleException("Only your own pending request can be cancelled.");
        }
        String previous = existing.getStatus().name();
        existing.setStatus(LeaveStatus.CANCELLED);
        LeaveRequest saved = leaveRequestRepository.save(existing);
        eventPublisher.publishEvent(new LeaveStatusChangedEvent(this, saved, previous));
        return saved;
    }

    @Transactional
    public LeaveRequest approve(User reviewer, Long id, String remarks) {
        LeaveRequest existing = getOrThrow(id);
        if (existing.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessRuleException("Only pending requests can be approved.");
        }
        String previous = existing.getStatus().name();

        existing.setStatus(LeaveStatus.APPROVED);
        existing.setReviewedBy(reviewer);
        existing.setReviewedOn(LocalDate.now());
        existing.setRemarks(remarks == null ? "" : remarks);
        LeaveRequest saved = leaveRequestRepository.save(existing);

        if (existing.getLeaveType().getDefaultDays() > 0) {
            LeaveBalance balance = leaveBalanceRepository
                    .findByUserAndLeaveTypeAndYear(existing.getUser(), existing.getLeaveType(), existing.getFromDate().getYear())
                    .orElseGet(() -> {
                        LeaveBalance created = new LeaveBalance();
                        created.setUser(existing.getUser());
                        created.setLeaveType(existing.getLeaveType());
                        created.setYear(existing.getFromDate().getYear());
                        created.setEntitledDays(existing.getLeaveType().getDefaultDays());
                        return created;
                    });
            balance.setUsedDays(balance.getUsedDays() + existing.getDays());
            leaveBalanceRepository.save(balance);
        }

        eventPublisher.publishEvent(new LeaveStatusChangedEvent(this, saved, previous));
        return saved;
    }

    @Transactional
    public LeaveRequest reject(User reviewer, Long id, String remarks) {
        LeaveRequest existing = getOrThrow(id);
        if (existing.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessRuleException("Only pending requests can be rejected.");
        }
        String previous = existing.getStatus().name();

        existing.setStatus(LeaveStatus.REJECTED);
        existing.setReviewedBy(reviewer);
        existing.setReviewedOn(LocalDate.now());
        existing.setRemarks(remarks == null ? "" : remarks);
        LeaveRequest saved = leaveRequestRepository.save(existing);

        eventPublisher.publishEvent(new LeaveStatusChangedEvent(this, saved, previous));
        return saved;
    }

    private void runValidation(LeaveRequest candidate, Long excludeRequestId) {
        for (LeaveValidationStrategy strategy : validationStrategies) {
            strategy.validate(candidate, excludeRequestId);
        }
    }

    private LeaveRequest getOrThrow(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Leave request not found."));
    }
}
