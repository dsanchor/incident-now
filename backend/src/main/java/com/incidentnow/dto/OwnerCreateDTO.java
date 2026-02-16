package com.incidentnow.dto;

import com.incidentnow.model.OwnerRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OwnerCreateDTO(
        @NotBlank(message = "Name is required") @Size(max = 255, message = "Name must not exceed 255 characters") String name,

        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,

        String phone,
        String avatarUrl,

        @NotBlank(message = "Team is required") String team,

        @NotNull(message = "Role is required") OwnerRole role,

        String department,
        String timezone,
        String slackHandle,
        String githubUsername,
        Boolean onCall) {
}
