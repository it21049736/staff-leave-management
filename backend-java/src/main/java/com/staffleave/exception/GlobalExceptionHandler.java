package com.staffleave.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FieldValidationException.class)
    public ResponseEntity<Map<String, List<String>>> handleFieldValidation(FieldValidationException ex) {
        return ResponseEntity.badRequest().body(Map.of(ex.getField(), List.of(ex.getMessage())));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<Map<String, String>> handleBusinessRule(BusinessRuleException ex) {
        return ResponseEntity.badRequest().body(Map.of("detail", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, List<String>> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                errors.computeIfAbsent(fe.getField(), k -> new java.util.ArrayList<>()).add(fe.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    /** Catches unique-constraint violations etc. that slip past application-level checks
     *  (e.g. a race between two admins creating the same leave type name at once), so the
     *  client gets a clean 400 instead of a raw SQL stack trace and a confusing status code. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.badRequest().body(Map.of("detail", "That value already exists or violates a data constraint."));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "Invalid username or password."));
    }

    // Spring Security 6 method security (@PreAuthorize) throws the newer
    // org.springframework.security.authorization.AuthorizationDeniedException, which is a
    // subtype of AccessDeniedException - one handler covers both old and new call sites.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "You do not have permission to perform this action."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("detail", ex.getMessage()));
    }
}
