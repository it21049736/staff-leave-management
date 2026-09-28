package com.staffleave.controller;

import com.staffleave.dto.DepartmentDto;
import com.staffleave.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping("/")
    public List<DepartmentDto> list() {
        return departmentRepository.findAll().stream()
                .sorted(Comparator.comparing(d -> d.getName().toLowerCase()))
                .map(DepartmentDto::from)
                .toList();
    }
}
