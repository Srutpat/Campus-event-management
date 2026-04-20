package com.example.eventmanagement.repository;

import com.example.eventmanagement.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // All queries use String status now — no Enum dependency
    List<Event> findByStatus(String status);

    List<Event> findByStatusIn(List<String> statuses);

    List<Event> findByOrganizerId(Long organizerId);

    List<Event> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId);

    List<Event> findAllByOrderByCreatedAtDesc();
    

    // Dept-scoped queries for role-based filtering
    @Query("SELECT e FROM Event e WHERE e.department = :dept ORDER BY e.createdAt DESC")
    List<Event> findByDepartmentOrderByCreatedAtDesc(@Param("dept") String dept);

    @Query("SELECT e FROM Event e WHERE e.department IS NULL OR e.department = '' ORDER BY e.createdAt DESC")
    List<Event> findCentralEventsOrderByCreatedAtDesc();

    // Analytics
    @Query("SELECT e.department, COUNT(e) FROM Event e WHERE e.department IS NOT NULL GROUP BY e.department")
    List<Object[]> countByDepartment();

    @Query("SELECT e.status, COUNT(e) FROM Event e GROUP BY e.status")
    List<Object[]> countByStatus();

    @Query("SELECT e.category, COUNT(e) FROM Event e WHERE e.category IS NOT NULL GROUP BY e.category")
    List<Object[]> countByCategory();
}