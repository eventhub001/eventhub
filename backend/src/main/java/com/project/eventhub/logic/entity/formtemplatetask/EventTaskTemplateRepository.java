package com.project.eventhub.logic.entity.formtemplatetask;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventTaskTemplateRepository extends JpaRepository<EventTaskTemplate, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM EventTaskTemplate ef WHERE ef.event.eventId = :eventId")
    void deleteEventTaskTemplateByEvent_EventId(@Param("eventId") Long id);
    // You can define custom query methods here if needed
}
