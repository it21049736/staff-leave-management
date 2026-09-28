package com.staffleave.service.validation;

import com.staffleave.entity.LeaveBalance;
import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.LeaveBalanceRepository;
import com.staffleave.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
@RequiredArgsConstructor
public class BalanceValidationStrategy implements LeaveValidationStrategy {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @Override
    public void validate(LeaveRequest candidate, Long excludeRequestId) {
        if (candidate.getLeaveType().getDefaultDays() <= 0) {
            return; // 0 default_days == unlimited (e.g. No-pay leave)
        }

        int year = candidate.getFromDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByUserAndLeaveTypeAndYear(candidate.getUser(), candidate.getLeaveType(), year)
                .orElseGet(() -> {
                    LeaveBalance created = new LeaveBalance();
                    created.setUser(candidate.getUser());
                    created.setLeaveType(candidate.getLeaveType());
                    created.setYear(year);
                    created.setEntitledDays(candidate.getLeaveType().getDefaultDays());
                    return leaveBalanceRepository.save(created);
                });

        int pendingDays = leaveRequestRepository
                .findByUserAndStatusIn(candidate.getUser(), java.util.List.of(LeaveStatus.PENDING))
                .stream()
                .filter(r -> r.getLeaveType().getId().equals(candidate.getLeaveType().getId()))
                .filter(r -> r.getFromDate().getYear() == year)
                .filter(r -> excludeRequestId == null || !r.getId().equals(excludeRequestId))
                .mapToInt(LeaveRequest::getDays)
                .sum();

        int reserved = balance.getUsedDays() + pendingDays;
        if (reserved + candidate.getDays() > balance.getEntitledDays()) {
            int remaining = balance.getRemaining() - pendingDays;
            throw new BusinessRuleException(
                    "Insufficient balance: " + remaining + " day(s) remaining for "
                            + candidate.getLeaveType().getName() + " after pending requests.");
        }
    }
}
