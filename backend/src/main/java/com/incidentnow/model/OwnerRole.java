package com.incidentnow.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum OwnerRole {
    ENGINEER("engineer"),
    SENIOR_ENGINEER("senior_engineer"),
    TEAM_LEAD("team_lead"),
    MANAGER("manager"),
    ADMIN("admin");

    private final String value;

    OwnerRole(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static OwnerRole fromValue(String value) {
        for (OwnerRole r : values()) {
            if (r.value.equalsIgnoreCase(value)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown owner role: " + value);
    }
}
