package com.staffleave.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Observer: reacts to LeaveStatusChangedEvent independently of the approval workflow. */
@Slf4j
@Component
public class LeaveAuditListener {

    @EventListener
    public void onLeaveStatusChanged(LeaveStatusChangedEvent event) {
        var req = event.getLeaveRequest();
        log.info(
                "Leave request #{} for {} changed {} -> {} by {}",
                req.getId(),
                req.getUser().getUsername(),
                event.getPreviousStatus(),
                req.getStatus(),
                req.getReviewedBy() != null ? req.getReviewedBy().getUsername() : "system"
        );
    }
}
