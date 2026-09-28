package com.staffleave.exception;

/** Raised for domain-rule violations (overlap, insufficient balance, invalid transition, etc.) */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
