package com.staffleave.repository;

import com.staffleave.entity.LeaveBalance;
import com.staffleave.entity.LeaveType;
import com.staffleave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findByUserAndYear(User user, int year);
    Optional<LeaveBalance> findByUserAndLeaveTypeAndYear(User user, LeaveType leaveType, int year);
}
