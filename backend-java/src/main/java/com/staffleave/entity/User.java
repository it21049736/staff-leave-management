package com.staffleave.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String username;

    @Column(nullable = false)
    private String password; // BCrypt hash

    @Column(length = 254)
    private String email;

    @Column(name = "first_name", length = 150)
    private String firstName;

    @Column(name = "last_name", length = 150)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.EMPLOYEE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 100)
    private String designation;

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Transient
    public String getFullName() {
        String first = firstName == null ? "" : firstName;
        String last = lastName == null ? "" : lastName;
        String full = (first + " " + last).trim();
        return full.isEmpty() ? username : full;
    }
}
