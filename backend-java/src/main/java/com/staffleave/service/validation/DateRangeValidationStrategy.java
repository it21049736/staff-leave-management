package com.staffleave.service.validation;

import com.staffleave.entity.LeaveRequest;
import com.staffleave.exception.BusinessRuleException;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Order(1)
public class DateRangeValidationStrategy implements LeaveValidationStrategy {

    private static final int MAX_BACKDATE_DAYS = 30;

    @Override
    public void validate(LeaveRequest candidate, Long excludeRequestId) {
        if (candidate.getToDate().isBefore(candidate.getFromDate())) {
            throw new BusinessRuleException("to_date must be on or after from_date.");
        }
        LocalDate earliestAllowed = LocalDate.now().minusDays(MAX_BACKDATE_DAYS);
        if (candidate.getFromDate().isBefore(earliestAllowed)) {
            throw new BusinessRuleException(
                    "Requests cannot be back-dated more than " + MAX_BACKDATE_DAYS + " days.");
        }
    }
}
