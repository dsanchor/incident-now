package com.incidentnow.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum IncidentCategory {
    NETWORK("network"),
    HARDWARE("hardware"),
    SOFTWARE("software"),
    SECURITY("security"),
    DATABASE("database"),
    CLOUD_INFRASTRUCTURE("cloud_infrastructure"),
    APPLICATION("application"),
    PERFORMANCE("performance"),
    ACCESS_PERMISSIONS("access_permissions"),
    OTHER("other");

    private final String value;

    IncidentCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static IncidentCategory fromValue(String value) {
        for (IncidentCategory c : values()) {
            if (c.value.equalsIgnoreCase(value)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown incident category: " + value);
    }
}
