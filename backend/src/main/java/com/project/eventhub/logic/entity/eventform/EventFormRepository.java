package com.project.eventhub.logic.entity.eventform;

import com.project.eventhub.logic.entity.eventform.EventForm;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventFormRepository extends JpaRepository<EventForm, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM EventForm ef WHERE ef.event.eventId = :eventId")
    void deleteEventFormByEvent_EventId(@Param("eventId") Long eventId);
    // You can define custom query methods here if needed
}
