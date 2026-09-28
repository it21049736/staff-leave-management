package com.staffleave.service.validation;

import com.staffleave.entity.LeaveRequest;

/**
 * STRATEGY PATTERN.
 * Each concrete strategy encapsulates one independent business rule for validating
 * a leave request (date-range sanity, back-dating limits, teammate/self overlap,
 * remaining-balance check, ...). LeaveService holds a List<LeaveValidationStrategy>
 * (Spring auto-wires every bean implementing this interface) and runs them all,
 * so a new rule is added by writing one new class - no existing code is touched
 * (Open/Closed Principle).
 */
public interface LeaveValidationStrategy {
    /** @throws com.staffleave.exception.BusinessRuleException if the candidate request violates this rule. */
    void validate(LeaveRequest candidate, Long excludeRequestId);
}
