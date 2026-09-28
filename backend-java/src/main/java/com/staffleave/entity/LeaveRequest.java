package com.staffleave.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(nullable = false)
    private int days;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "applied_on", nullable = false, updatable = false)
    private LocalDate appliedOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "reviewed_on")
    private LocalDate reviewedOn;

    @Column(columnDefinition = "TEXT")
    private String remarks = "";

    @PrePersist
    protected void onCreate() {
        appliedOn = LocalDate.now();
        recomputeDays();
    }

    @PreUpdate
    protected void onUpdate() {
        recomputeDays();
    }

    private void recomputeDays() {
        if (fromDate != null && toDate != null) {
            this.days = (int) (ChronoUnit.DAYS.between(fromDate, toDate) + 1);
        }
    }
}
