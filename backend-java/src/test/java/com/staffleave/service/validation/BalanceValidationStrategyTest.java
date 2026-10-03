package com.staffleave.service.validation;

import com.staffleave.entity.LeaveBalance;
import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveType;
import com.staffleave.entity.User;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.LeaveBalanceRepository;
import com.staffleave.repository.LeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BalanceValidationStrategyTest {

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;
    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    private BalanceValidationStrategy strategy;
    private User user;
    private LeaveType leaveType;

    @BeforeEach
    void setUp() {
        strategy = new BalanceValidationStrategy(leaveBalanceRepository, leaveRequestRepository);
        user = new User();
        user.setId(1L);
        leaveType = new LeaveType();
        leaveType.setId(1L);
        leaveType.setName("Annual");
        leaveType.setDefaultDays(14);
    }

    private LeaveRequest requestFor(int days) {
        LeaveRequest request = new LeaveRequest();
        request.setUser(user);
        request.setLeaveType(leaveType);
        request.setFromDate(LocalDate.now());
        request.setToDate(LocalDate.now().plusDays(days - 1));
        request.setDays(days);
        return request;
    }

    private LeaveBalance balanceWith(int entitled, int used) {
        LeaveBalance balance = new LeaveBalance();
        balance.setUser(user);
        balance.setLeaveType(leaveType);
        balance.setEntitledDays(entitled);
        balance.setUsedDays(used);
        return balance;
    }

    @Test
    void skipsCheckForUnlimitedLeaveTypes() {
        leaveType.setDefaultDays(0);
        assertDoesNotThrow(() -> strategy.validate(requestFor(100), null));
    }

    @Test
    void allowsRequestWithinRemainingBalance() {
        when(leaveBalanceRepository.findByUserAndLeaveTypeAndYear(any(), any(), any(Integer.class)))
                .thenReturn(Optional.of(balanceWith(14, 2)));
        when(leaveRequestRepository.findByUserAndStatusIn(any(), any())).thenReturn(List.of());

        assertDoesNotThrow(() -> strategy.validate(requestFor(5), null));
    }

    @Test
    void rejectsRequestExceedingRemainingBalance() {
        when(leaveBalanceRepository.findByUserAndLeaveTypeAndYear(any(), any(), any(Integer.class)))
                .thenReturn(Optional.of(balanceWith(14, 12)));
        when(leaveRequestRepository.findByUserAndStatusIn(any(), any())).thenReturn(List.of());

        assertThrows(BusinessRuleException.class, () -> strategy.validate(requestFor(5), null));
    }
}
