package com.staffleave.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leave_types")
@Data
@NoArgsConstructor
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String name;

    @Column(name = "default_days", nullable = false)
    private int defaultDays = 0; // 0 = unlimited (no-pay)

    @Column(name = "requires_document", nullable = false)
    private boolean requiresDocument = false;
}
