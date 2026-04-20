package com.example.eventmanagement.service;

import com.example.eventmanagement.dto.ApprovalRequest;
import com.example.eventmanagement.dto.EventRequest;
import com.example.eventmanagement.dto.PostEventRequest;
import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.EventRepository;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    // ── ONLY 5 STATUSES ──────────────────────────────────────────────────────
    public static final String PENDING_FACULTY = "PENDING_FACULTY";
    public static final String PENDING_SDW     = "PENDING_SDW";
    public static final String PENDING_HOD     = "PENDING_HOD";
    public static final String APPROVED        = "APPROVED";
    public static final String REJECTED        = "REJECTED";

    private final EventRepository eventRepo;
    private final UserRepository  userRepo;

    public EventService(EventRepository eventRepo, UserRepository userRepo) {
        this.eventRepo = eventRepo;
        this.userRepo  = userRepo;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    public Event createEvent(EventRequest req) {
        User organizer = userRepo.findById(req.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        if (req.getEstimatedBudget() == null)
            throw new RuntimeException("Budget is required (enter 0 if no budget)");
        Event event = applyRequest(new Event(), req);
        event.setOrganizer(organizer);
        event.setStatus(PENDING_FACULTY);
        return eventRepo.save(event);
    }

    // ── UPDATE (organizer edits after rejection) ───────────────────────────────
    public Event updateEvent(Long id, EventRequest req) {
        Event event = getById(id);
        applyRequest(event, req);
        if (REJECTED.equals(event.getStatus())) {
            event.setStatus(PENDING_FACULTY);
            event.setFacultyComment(null);
            event.setSdwComment(null);
            event.setHodComment(null);
        }
        return eventRepo.save(event);
    }

    public void deleteEvent(Long id) { eventRepo.delete(getById(id)); }

    // ── FACULTY REVIEW ────────────────────────────────────────────────────────
    // Approve  → PENDING_SDW (skip separate budget step — budget already in event)
    // Reject   → REJECTED
    public Event facultyReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (!PENDING_FACULTY.equals(event.getStatus()))
            throw new RuntimeException("Event is not awaiting Faculty review.");
        event.setFacultyComment(req.getComment());
        if ("APPROVE".equalsIgnoreCase(req.getAction())) {
            // Faculty approves → goes directly to SDW (budget was submitted at creation)
            event.setStatus(PENDING_SDW);
        } else {
            event.setStatus(REJECTED);
        }
        return eventRepo.save(event);
    }

    // ── SDW REVIEW ────────────────────────────────────────────────────────────
    // Approve → PENDING_HOD
    // Reject  → REJECTED
    public Event sdwReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (!PENDING_SDW.equals(event.getStatus()))
            throw new RuntimeException("Event is not awaiting SDW review.");
        event.setSdwComment(req.getComment());
        if ("APPROVE".equalsIgnoreCase(req.getAction())) {
            event.setStatus(PENDING_HOD);
        } else {
            event.setStatus(REJECTED);
        }
        return eventRepo.save(event);
    }

    // ── HOD REVIEW ────────────────────────────────────────────────────────────
    // Approve → APPROVED (event goes live to students)
    // Reject  → REJECTED
    public Event hodReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (!PENDING_HOD.equals(event.getStatus()))
            throw new RuntimeException("Event is not awaiting HoD review.");
        event.setHodComment(req.getComment());
        event.setStatus("APPROVE".equalsIgnoreCase(req.getAction()) ? APPROVED : REJECTED);
        return eventRepo.save(event);
    }

    // ── SUBMIT BUDGET (kept for backward compat, now just updates budget fields) ─
    public Event submitBudget(Long id, EventRequest req) {
        Event event = getById(id);
        event.setEstimatedBudget(req.getEstimatedBudget() != null ? req.getEstimatedBudget() : 0.0);
        event.setVenueExpense(req.getVenueExpense());
        event.setFoodExpense(req.getFoodExpense());
        event.setDecorExpense(req.getDecorExpense());
        event.setPrintingExpense(req.getPrintingExpense());
        event.setOtherExpense(req.getOtherExpense());
        event.setBudgetNotes(req.getBudgetNotes());
        return eventRepo.save(event);
    }

    // ── POST-EVENT REPORT ──────────────────────────────────────────────────────
    public Event submitPostEventReport(Long id, PostEventRequest req) {
        Event event = getById(id);
        event.setEventReport(req.getEventReport());
        event.setActualExpenditure(req.getActualExpenditure());
        event.setReimbursementDetails(req.getReimbursementDetails());
        // Store PDF as base64 so Faculty/SDW can view/download it
        if (req.getReportFileData() != null && !req.getReportFileData().isBlank()) {
            event.setReportFileData(req.getReportFileData());
            event.setReportFileName(req.getReportFileName());
        }
        return eventRepo.save(event);
    }

    // ── ANALYTICS ─────────────────────────────────────────────────────────────
    public Map<String, Object> getAnalytics() {
        Map<String, Object> data = new HashMap<>();
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : eventRepo.countByStatus())
            byStatus.put(String.valueOf(row[0]), (Long) row[1]);
        data.put("byStatus", byStatus);
        Map<String, Long> byDept = new HashMap<>();
        for (Object[] row : eventRepo.countByDepartment())
            byDept.put(String.valueOf(row[0]), (Long) row[1]);
        data.put("byDepartment", byDept);
        Map<String, Long> byCat = new HashMap<>();
        for (Object[] row : eventRepo.countByCategory())
            byCat.put(String.valueOf(row[0]), (Long) row[1]);
        data.put("byCategory", byCat);
        data.put("total",    eventRepo.count());
        data.put("approved", (long) eventRepo.findByStatus(APPROVED).size());
        data.put("pending",  (long) eventRepo.findByStatusIn(
            List.of(PENDING_FACULTY, PENDING_SDW, PENDING_HOD)).size());
        return data;
    }

    // ── QUERIES ───────────────────────────────────────────────────────────────
    public Event getById(Long id) {
        return eventRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }
    public List<Event> getAllEvents()       { return eventRepo.findAllByOrderByCreatedAtDesc(); }
    public List<Event> getApprovedEvents() { return eventRepo.findByStatus(APPROVED); }
    public List<Event> getByOrganizer(Long id) {
        return eventRepo.findByOrganizerIdOrderByCreatedAtDesc(id);
    }

    // ── HELPER ────────────────────────────────────────────────────────────────
    private Event applyRequest(Event e, EventRequest req) {
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setLocation(req.getLocation());
        e.setDepartment(req.getDepartment());
        e.setCategory(req.getCategory());
        e.setClubName(req.getClubName());
        e.setClubDepartment(req.getClubDepartment());
        e.setClubWebsite(req.getClubWebsite());
        e.setIsCentralEvent(req.getIsCentralEvent());
        e.setTheme(req.getTheme());
        e.setEventType(req.getEventType());
        e.setSpeakerName(req.getSpeakerName());
        e.setSpeakerDetails(req.getSpeakerDetails());
        e.setCoordinatorName(req.getCoordinatorName());
        e.setCoordinatorContact(req.getCoordinatorContact());
        e.setCoordinatorsJson(req.getCoordinatorsJson());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setEventDate(req.getStartDate());
        e.setRegistrationDeadline(req.getRegistrationDeadline());
        e.setGoLiveDate(req.getGoLiveDate());
        e.setMaxParticipants(req.getMaxParticipants());
        e.setEntryFee(req.getEntryFee());
        e.setPrizePool(req.getPrizePool());
        e.setGoodies(req.getGoodies());
        e.setEstimatedBudget(req.getEstimatedBudget() != null ? req.getEstimatedBudget() : 0.0);
        if (req.getVenueExpense()    != null) e.setVenueExpense(req.getVenueExpense());
        if (req.getFoodExpense()     != null) e.setFoodExpense(req.getFoodExpense());
        if (req.getDecorExpense()    != null) e.setDecorExpense(req.getDecorExpense());
        if (req.getPrintingExpense() != null) e.setPrintingExpense(req.getPrintingExpense());
        if (req.getOtherExpense()    != null) e.setOtherExpense(req.getOtherExpense());
        if (req.getBudgetNotes()     != null) e.setBudgetNotes(req.getBudgetNotes());
        return e;
    }
    public List<Event> getPendingFaculty() {
    return eventRepo.findByStatus("PENDING_FACULTY");
}

public List<Event> getPendingSdw() {
    return eventRepo.findByStatus("PENDING_SDW");
}

public List<Event> getPendingHod() {
    return eventRepo.findByStatus("PENDING_HOD");
}
}