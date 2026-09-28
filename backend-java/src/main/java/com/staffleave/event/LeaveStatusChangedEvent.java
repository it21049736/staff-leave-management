package com.staffleave.event;

import com.staffleave.entity.LeaveRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * OBSERVER PATTERN.
 * Published by LeaveService whenever a request is approved or rejected. LeaveService
 * (the subject) has no knowledge of who is listening - it just publishes the event
 * and moves on. LeaveAuditListener (the observer) reacts independently. This keeps
 * the approval/rejection workflow decoupled from side effects like audit logging or
 * (in a future iteration) email/SMS notifications - a new observer can be added
 * without touching LeaveService at all.
 */
@Getter
public class LeaveStatusChangedEvent extends ApplicationEvent {

    private final LeaveRequest leaveRequest;
    private final String previousStatus;

    public LeaveStatusChangedEvent(Object source, LeaveRequest leaveRequest, String previousStatus) {
        super(source);
        this.leaveRequest = leaveRequest;
        this.previousStatus = previousStatus;
    }
}
