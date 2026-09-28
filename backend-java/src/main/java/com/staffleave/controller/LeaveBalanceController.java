package com.staffleave.controller;

import com.staffleave.dto.LeaveBalanceDto;
import com.staffleave.security.CurrentUser;
import com.staffleave.repository.LeaveBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class LeaveBalanceController {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final CurrentUser currentUser;

    @GetMapping("/")
    public List<LeaveBalanceDto> list(Authentication authentication,
                                       @RequestParam(required = false) Integer year) {
        int y = year != null ? year : LocalDate.now().getYear();
        return leaveBalanceRepository.findByUserAndYear(currentUser.get(authentication), y).stream()
                .map(LeaveBalanceDto::from)
                .toList();
    }
}
