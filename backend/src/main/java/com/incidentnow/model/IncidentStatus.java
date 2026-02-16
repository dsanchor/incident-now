package com.incidentnow.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum IncidentStatus {
    OPEN("open"),
    IN_PROGRESS("in_progress"),
    ON_HOLD("on_hold"),
    RESOLVED("resolved"),
    CLOSED("closed");

    private final String value;

    IncidentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static IncidentStatus fromValue(String value) {
        for (IncidentStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown incident status: " + value);
    }
}
