package com.staffleave.exception;

/** Raised when a single named field fails validation, so the frontend's
 *  err.response.data.<field>[0] parsing (inherited from the DRF-era API) keeps working. */
public class FieldValidationException extends RuntimeException {
    private final String field;

    public FieldValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
