package com.example.eventmanagement.model;

/**
 * Event lifecycle:
 * DRAFT → PENDING_FACULTY → FACULTY_APPROVED → PENDING_SDW → SDW_APPROVED → PENDING_HOD → APPROVED
 *                        ↘ FACULTY_REJECTED   ↘ SDW_REJECTED               ↘ HOD_REJECTED
 */
public enum EventStatus {
    PENDING_FACULTY,
    PENDING_SDW,
    PENDING_HOD,
    APPROVED,
    REJECTED
}