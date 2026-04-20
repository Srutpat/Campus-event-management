package com.example.eventmanagement.controller;

import com.example.eventmanagement.dto.ApprovalRequest;
import com.example.eventmanagement.dto.EventRequest;
import com.example.eventmanagement.dto.PostEventRequest;
import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService svc;
    public EventController(EventService svc) { this.svc = svc; }

    @GetMapping                     public ResponseEntity<List<Event>> getAll()      { return ResponseEntity.ok(svc.getAllEvents()); }
    @GetMapping("/approved")        public ResponseEntity<List<Event>> getApproved() { return ResponseEntity.ok(svc.getApprovedEvents()); }
    // @GetMapping("/pending/faculty") public ResponseEntity<List<Event>> pendFaculty() { return ResponseEntity.ok(svc.getPendingFaculty()); }
    // @GetMapping("/pending/sdw")     public ResponseEntity<List<Event>> pendSdw()     { return ResponseEntity.ok(svc.getPendingSdw()); }
    // @GetMapping("/pending/hod")     public ResponseEntity<List<Event>> pendHod()     { return ResponseEntity.ok(svc.getPendingHod()); }
    @GetMapping("/organizer/{id}")  public ResponseEntity<List<Event>> byOrg(@PathVariable Long id) { return ResponseEntity.ok(svc.getByOrganizer(id)); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(svc.getById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(404).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody EventRequest req) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(svc.createEvent(req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EventRequest req) {
        try { return ResponseEntity.ok(svc.updateEvent(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { svc.deleteEvent(id); return ResponseEntity.ok("Deleted"); }
        catch (RuntimeException e) { return ResponseEntity.status(404).body(e.getMessage()); }
    }

    @PostMapping("/{id}/budget")
    public ResponseEntity<?> submitBudget(@PathVariable Long id, @RequestBody EventRequest req) {
        try { return ResponseEntity.ok(svc.submitBudget(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/{id}/faculty-review")
    public ResponseEntity<?> facultyReview(@PathVariable Long id, @RequestBody ApprovalRequest req) {
        try { return ResponseEntity.ok(svc.facultyReview(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/{id}/sdw-review")
    public ResponseEntity<?> sdwReview(@PathVariable Long id, @RequestBody ApprovalRequest req) {
        try { return ResponseEntity.ok(svc.sdwReview(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // @PostMapping("/{id}/forward-hod")
    // public ResponseEntity<?> forwardToHod(@PathVariable Long id) {
    //     try { return ResponseEntity.ok(svc.forwardToHod(id)); }
    //     catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    // }

    /** Central events (NSS etc) — faculty sends directly to SDW Dean, skipping dept SDW */
    // @PostMapping("/{id}/forward-dean")
    // public ResponseEntity<?> forwardToDean(@PathVariable Long id) {
    //     try { return ResponseEntity.ok(svc.forwardToDean(id)); }
    //     catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    // }

    @PostMapping("/{id}/hod-review")
    public ResponseEntity<?> hodReview(@PathVariable Long id, @RequestBody ApprovalRequest req) {
        try { return ResponseEntity.ok(svc.hodReview(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/{id}/post-event")
    public ResponseEntity<?> postEvent(@PathVariable Long id, @RequestBody PostEventRequest req) {
        try { return ResponseEntity.ok(svc.submitPostEventReport(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    /** USP: Analytics endpoint — all roles can access */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        return ResponseEntity.ok(svc.getAnalytics());
    }
}