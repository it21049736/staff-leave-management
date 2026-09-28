package com.staffleave.service.validation;

import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
public class OverlapValidationStrategy implements LeaveValidationStrategy {

    private final LeaveRequestRepository leaveRequestRepository;

    @Override
    public void validate(LeaveRequest candidate, Long excludeRequestId) {
        List<LeaveRequest> overlapping = leaveRequestRepository
                .findByUserAndStatusInAndFromDateLessThanEqualAndToDateGreaterThanEqual(
                        candidate.getUser(),
                        List.of(LeaveStatus.PENDING, LeaveStatus.APPROVED),
                        candidate.getToDate(),
                        candidate.getFromDate());

        boolean conflicts = overlapping.stream()
                .anyMatch(r -> excludeRequestId == null || !r.getId().equals(excludeRequestId));

        if (conflicts) {
            throw new BusinessRuleException(
                    "This request overlaps with an existing pending or approved leave request.");
        }
    }
}
