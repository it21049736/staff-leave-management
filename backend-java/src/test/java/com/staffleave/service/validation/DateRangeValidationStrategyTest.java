package com.staffleave.service.validation;

import com.staffleave.entity.LeaveRequest;
import com.staffleave.exception.BusinessRuleException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DateRangeValidationStrategyTest {

    private final DateRangeValidationStrategy strategy = new DateRangeValidationStrategy();

    private LeaveRequest requestFor(LocalDate from, LocalDate to) {
        LeaveRequest request = new LeaveRequest();
        request.setFromDate(from);
        request.setToDate(to);
        return request;
    }

    @Test
    void acceptsValidRange() {
        LocalDate today = LocalDate.now();
        assertDoesNotThrow(() -> strategy.validate(requestFor(today, today.plusDays(2)), null));
    }

    @Test
    void rejectsToDateBeforeFromDate() {
        LocalDate today = LocalDate.now();
        assertThrows(BusinessRuleException.class,
                () -> strategy.validate(requestFor(today, today.minusDays(1)), null));
    }

    @Test
    void rejectsExcessiveBackdating() {
        LocalDate farPast = LocalDate.now().minusDays(45);
        assertThrows(BusinessRuleException.class,
                () -> strategy.validate(requestFor(farPast, farPast.plusDays(1)), null));
    }
}
