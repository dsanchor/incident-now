package com.incidentnow.dto;

import java.util.List;

public record PagedResponseDTO<T>(
        List<T> data,
        PaginationDTO pagination) {
}
