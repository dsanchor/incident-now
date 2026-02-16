package com.incidentnow.dto;

import com.incidentnow.model.OwnerRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record OwnerPatchDTO(
        @Size(max = 255, message = "Name must not exceed 255 characters") String name,

        @Email(message = "Email must be valid") String email,

        String phone,
        String avatarUrl,
        String team,
        OwnerRole role,
        String department,
        String timezone,
        String slackHandle,
        String githubUsername,
        Boolean active,
        Boolean onCall) {
}
