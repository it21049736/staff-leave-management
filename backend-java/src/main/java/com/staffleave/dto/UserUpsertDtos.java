package com.staffleave.dto;

import lombok.Data;

public class UserUpsertDtos {

    @Data
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String email;
        private String firstName;
        private String lastName;
        private String role = "employee";
        private Long department;
        private String designation;
    }

    @Data
    public static class UpdateUserRequest {
        private String email;
        private String firstName;
        private String lastName;
        private Long department;
        private String designation;
        private Boolean isActive;
    }

    @Data
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String designation;
    }
}
