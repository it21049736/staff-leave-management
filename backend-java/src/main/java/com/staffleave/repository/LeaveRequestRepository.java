package com.staffleave.repository;

import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import com.staffleave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest> {

    List<LeaveRequest> findByUserOrderByAppliedOnDescIdDesc(User user);

    List<LeaveRequest> findByUserAndStatusIn(User user, List<LeaveStatus> statuses);

    // Overlap check: same user, active status, date ranges intersect
    List<LeaveRequest> findByUserAndStatusInAndFromDateLessThanEqualAndToDateGreaterThanEqual(
            User user, List<LeaveStatus> statuses, LocalDate to, LocalDate from);
}
