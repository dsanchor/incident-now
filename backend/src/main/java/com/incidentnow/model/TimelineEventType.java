package com.incidentnow.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TimelineEventType {
    CREATED("created"),
    STATUS_CHANGED("status_changed"),
    PRIORITY_CHANGED("priority_changed"),
    SEVERITY_CHANGED("severity_changed"),
    ASSIGNED("assigned"),
    UNASSIGNED("unassigned"),
    OWNER_CHANGED("owner_changed"),
    COMMENT_ADDED("comment_added"),
    RESOLVED("resolved"),
    CLOSED("closed"),
    REOPENED("reopened"),
    GITHUB_LINKED("github_linked"),
    GITHUB_UPDATED("github_updated"),
    SLA_BREACHED("sla_breached");

    private final String value;

    TimelineEventType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static TimelineEventType fromValue(String value) {
        for (TimelineEventType t : values()) {
            if (t.value.equalsIgnoreCase(value)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Unknown timeline event type: " + value);
    }
}
