package com.incidentnow.dto;

public record PaginationDTO(
        int page,
        int pageSize,
        long totalItems,
        int totalPages,
        boolean hasNextPage,
        boolean hasPreviousPage) {
    public static PaginationDTO of(int page, int pageSize, long totalItems) {
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);
        return new PaginationDTO(
                page,
                pageSize,
                totalItems,
                totalPages,
                page < totalPages,
                page > 1);
    }
}
