package com.staffleave.dto;

import com.staffleave.entity.Department;
import lombok.Data;

@Data
public class DepartmentDto {
    private Long id;
    private String name;

    public static DepartmentDto from(Department d) {
        DepartmentDto dto = new DepartmentDto();
        dto.id = d.getId();
        dto.name = d.getName();
        return dto;
    }
}
