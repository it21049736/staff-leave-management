package com.staffleave.config;

import com.staffleave.entity.*;
import com.staffleave.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/** Equivalent of the Django "seed_demo" management command: departments, leave
 *  types, an admin, a handful of employees, and a realistic spread of sample
 *  leave requests, so the app is demo-ready immediately after first boot. */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final UserRepository userRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Data already seeded, skipping.");
            return;
        }

        Map<String, Department> depts = new LinkedHashMap<>();
        for (String name : new String[]{"Engineering", "Human Resources", "Product Design", "Marketing", "Finance"}) {
            Department d = new Department();
            d.setName(name);
            depts.put(name, departmentRepository.save(d));
        }

        Map<String, LeaveType> types = new LinkedHashMap<>();
        Object[][] typeDefs = {
                {"Annual", 18, false}, {"Sick", 10, true}, {"Casual", 7, false},
                {"Parental", 30, true}, {"Compensatory Off", 5, false}, {"No-pay", 0, false},
        };
        for (Object[] def : typeDefs) {
            LeaveType t = new LeaveType();
            t.setName((String) def[0]);
            t.setDefaultDays((int) def[1]);
            t.setRequiresDocument((boolean) def[2]);
            types.put(t.getName(), leaveTypeRepository.save(t));
        }

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("Admin@1234"));
        admin.setEmail("admin@example.com");
        admin.setFirstName("System");
        admin.setLastName("Admin");
        admin.setRole(Role.ADMIN);
        admin.setDepartment(depts.get("Human Resources"));
        admin.setDesignation("HR Manager");
        admin.setJoinedDate(LocalDate.now());
        admin.setActive(true);
        admin = userRepository.save(admin);
        log.info("Created admin user: admin / Admin@1234");

        Object[][] employeeDefs = {
                {"employee1", "Jane", "Doe", "Engineering", "Software Engineer"},
                {"sarah.jenkins", "Sarah", "Jenkins", "Engineering", "Backend Engineer"},
                {"marcus.vance", "Marcus", "Vance", "Product Design", "Product Designer"},
                {"elena.rostova", "Elena", "Rostova", "Marketing", "Marketing Lead"},
                {"daniel.wu", "Daniel", "Wu", "Finance", "Financial Analyst"},
                {"alex.rivera", "Alex", "Rivera", "Engineering", "DevOps Engineer"},
                {"karen.lewis", "Karen", "Lewis", "Human Resources", "HR Coordinator"},
                {"thomas.chen", "Thomas", "Chen", "Product Design", "UX Researcher"},
        };

        Map<String, User> employees = new LinkedHashMap<>();
        for (Object[] def : employeeDefs) {
            String username = (String) def[0];
            User emp = new User();
            emp.setUsername(username);
            emp.setPassword(passwordEncoder.encode("Employee@1234"));
            emp.setEmail(username.replace(".", "") + "@company.io");
            emp.setFirstName((String) def[1]);
            emp.setLastName((String) def[2]);
            emp.setRole(Role.EMPLOYEE);
            emp.setDepartment(depts.get((String) def[3]));
            emp.setDesignation((String) def[4]);
            emp.setJoinedDate(LocalDate.now());
            emp.setActive(true);
            emp = userRepository.save(emp);
            employees.put(username, emp);

            for (LeaveType t : types.values()) {
                if (t.getDefaultDays() <= 0) continue;
                LeaveBalance b = new LeaveBalance();
                b.setUser(emp);
                b.setLeaveType(t);
                b.setYear(LocalDate.now().getYear());
                b.setEntitledDays(t.getDefaultDays());
                leaveBalanceRepository.save(b);
            }
        }
        log.info("Created {} employee accounts (password: Employee@1234)", employeeDefs.length);

        LocalDate today = LocalDate.now();
        Object[][] requestDefs = {
                {"sarah.jenkins", "Annual", 7, 10, LeaveStatus.PENDING, "Family trip and personal recharge"},
                {"marcus.vance", "Sick", 3, 4, LeaveStatus.PENDING, "Dental surgery recovery"},
                {"elena.rostova", "Parental", 15, 46, LeaveStatus.PENDING, "Maternity transition phase"},
                {"daniel.wu", "Compensatory Off", 4, 4, LeaveStatus.PENDING, "Weekend overtime payback"},
                {"thomas.chen", "Casual", 2, 2, LeaveStatus.PENDING, "Personal errand"},
                {"karen.lewis", "Sick", 6, 7, LeaveStatus.PENDING, "Flu recovery"},
                {"employee1", "Annual", 12, 13, LeaveStatus.PENDING, "Long weekend getaway"},
                {"alex.rivera", "Annual", -3, 1, LeaveStatus.APPROVED, "Family trip"},
                {"karen.lewis", "Sick", -1, 0, LeaveStatus.APPROVED, "Feeling unwell"},
                {"thomas.chen", "Casual", -5, -3, LeaveStatus.APPROVED, "Personal time off"},
                {"employee1", "Annual", -20, -18, LeaveStatus.APPROVED, "Short vacation"},
                {"sarah.jenkins", "Sick", -30, -29, LeaveStatus.APPROVED, "Doctor visit"},
                {"marcus.vance", "No-pay", -10, -8, LeaveStatus.REJECTED, "Policy clash with sprint deadline"},
                {"daniel.wu", "Casual", -15, -15, LeaveStatus.CANCELLED, "Plans changed"},
        };

        int created = 0;
        for (Object[] def : requestDefs) {
            User user = employees.get((String) def[0]);
            LeaveType type = types.get((String) def[1]);
            if (user == null || type == null) continue;

            LeaveRequest req = new LeaveRequest();
            req.setUser(user);
            req.setLeaveType(type);
            req.setFromDate(today.plusDays((int) def[2]));
            req.setToDate(today.plusDays((int) def[3]));
            req.setReason((String) def[5]);
            req.setStatus((LeaveStatus) def[4]);
            if (req.getStatus() == LeaveStatus.APPROVED || req.getStatus() == LeaveStatus.REJECTED) {
                req.setReviewedBy(admin);
                req.setReviewedOn(today);
            }
            leaveRequestRepository.save(req);
            created++;
        }
        log.info("Created {} sample leave requests.", created);
        log.info("Demo data seeded.");
    }
}
