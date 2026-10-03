package com.staffleave.service.validation;

import com.staffleave.entity.LeaveRequest;
import com.staffleave.entity.LeaveStatus;
import com.staffleave.entity.User;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.LeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OverlapValidationStrategyTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    private OverlapValidationStrategy strategy;
    private User user;

    @BeforeEach
    void setUp() {
        strategy = new OverlapValidationStrategy(leaveRequestRepository);
        user = new User();
        user.setId(1L);
    }

    private LeaveRequest requestFor(LocalDate from, LocalDate to) {
        LeaveRequest request = new LeaveRequest();
        request.setUser(user);
        request.setFromDate(from);
        request.setToDate(to);
        return request;
    }

    @Test
    void allowsRequestWhenNoOverlapExists() {
        when(leaveRequestRepository.findByUserAndStatusInAndFromDateLessThanEqualAndToDateGreaterThanEqual(
                any(), anyList(), any(), any())).thenReturn(List.of());

        LocalDate today = LocalDate.now();
        assertDoesNotThrow(() -> strategy.validate(requestFor(today, today.plusDays(1)), null));
    }

    @Test
    void rejectsRequestOverlappingAnExistingOne() {
        LeaveRequest existing = requestFor(LocalDate.now(), LocalDate.now().plusDays(2));
        existing.setId(99L);
        existing.setStatus(LeaveStatus.APPROVED);

        when(leaveRequestRepository.findByUserAndStatusInAndFromDateLessThanEqualAndToDateGreaterThanEqual(
                any(), anyList(), any(), any())).thenReturn(List.of(existing));

        LocalDate today = LocalDate.now();
        assertThrows(BusinessRuleException.class,
                () -> strategy.validate(requestFor(today, today.plusDays(1)), null));
    }

    @Test
    void ignoresTheExcludedRequestWhenEditing() {
        LeaveRequest existing = requestFor(LocalDate.now(), LocalDate.now().plusDays(2));
        existing.setId(99L);

        when(leaveRequestRepository.findByUserAndStatusInAndFromDateLessThanEqualAndToDateGreaterThanEqual(
                any(), anyList(), any(), any())).thenReturn(List.of(existing));

        LocalDate today = LocalDate.now();
        assertDoesNotThrow(() -> strategy.validate(requestFor(today, today.plusDays(1)), 99L));
    }
}
