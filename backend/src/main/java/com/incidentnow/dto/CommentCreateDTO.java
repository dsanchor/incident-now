package com.incidentnow.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentCreateDTO(
        @NotBlank(message = "Content is required") String content,

        Boolean isInternal) {
}
