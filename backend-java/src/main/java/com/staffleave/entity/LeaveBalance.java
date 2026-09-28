package com.staffleave.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leave_balances", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "leave_type_id", "year"}))
@Data
@NoArgsConstructor
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private int year;

    @Column(name = "entitled_days", nullable = false)
    private int entitledDays;

    @Column(name = "used_days", nullable = false)
    private int usedDays = 0;

    @Transient
    public int getRemaining() {
        return entitledDays - usedDays;
    }
}
