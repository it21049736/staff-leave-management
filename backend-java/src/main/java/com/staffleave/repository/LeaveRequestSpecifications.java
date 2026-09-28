package com.staffleave.repository;

import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/** Builds dynamic WHERE clauses for the admin leave-records listing, equivalent
 *  to the Django LeaveRequestFilter (status / dept / leave_type / from_date / to_date / q). */
public class LeaveRequestSpecifications {

    public static Specification<LeaveRequest> withFilters(
            String status, Long departmentId, Long leaveTypeId,
            LocalDate fromDate, LocalDate toDate, String q, Long onlyUserId) {

        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (onlyUserId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("user").get("id"), onlyUserId));
            }
            if (status != null && !status.isBlank()) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), LeaveStatus.valueOf(status.toUpperCase())));
            }
            if (departmentId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("user").get("department").get("id"), departmentId));
            }
            if (leaveTypeId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("leaveType").get("id"), leaveTypeId));
            }
            if (fromDate != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("fromDate"), fromDate));
            }
            if (toDate != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("toDate"), toDate));
            }
            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase() + "%";
                Predicate first = cb.like(cb.lower(root.get("user").get("firstName")), like);
                Predicate last = cb.like(cb.lower(root.get("user").get("lastName")), like);
                Predicate uname = cb.like(cb.lower(root.get("user").get("username")), like);
                predicate = cb.and(predicate, cb.or(first, last, uname));
            }
            return predicate;
        };
    }
}
