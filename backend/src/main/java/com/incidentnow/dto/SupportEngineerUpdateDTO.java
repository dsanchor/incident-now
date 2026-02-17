package com.incidentnow.dto;

import com.incidentnow.model.IncidentCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.List;

public record SupportEngineerUpdateDTO(
        @NotBlank(message = "Name is required") @Size(max = 255, message = "Name must not exceed 255 characters") String name,

        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,

        String phone,
        String avatarUrl,
        String timezone,
        String slackHandle,
        String githubUsername,
        Boolean active,
        Boolean onCall,
        LocalTime workingHoursStart,
        LocalTime workingHoursEnd,
        List<IncidentCategory> categories) {
}
