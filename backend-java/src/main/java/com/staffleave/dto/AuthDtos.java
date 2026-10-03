package com.staffleave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDtos {

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String access;
        private String refresh;
        private UserDto user;

        public LoginResponse(String access, String refresh, UserDto user) {
            this.access = access;
            this.refresh = refresh;
            this.user = user;
        }
    }

    @Data
    public static class RefreshRequest {
        @NotBlank
        private String refresh;
    }

    @Data
    public static class RefreshResponse {
        private String access;

        public RefreshResponse(String access) {
            this.access = access;
        }
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank
        private String oldPassword;

        @NotBlank(message = "New password is required.")
        @Size(min = 8, message = "New password must be at least 8 characters.")
        private String newPassword;
    }
}
