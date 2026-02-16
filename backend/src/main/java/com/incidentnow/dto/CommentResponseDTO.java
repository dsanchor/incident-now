package com.incidentnow.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponseDTO(
        UUID id,
        UUID incidentId,
        OwnerSummaryDTO author,
        String content,
        boolean isInternal,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
