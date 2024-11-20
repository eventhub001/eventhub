package com.project.eventhub.logic.entity.task;

import com.project.eventhub.logic.entity.event.Event;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Integer> {

    Page<Task> getTaskByEvent_EventId(Long eventId, Pageable pageable);

    @Query("SELECT t FROM Task t JOIN Event e ON t.event.eventId = e.eventId WHERE e.userId = :userId")
    Page<Task> findAllByUserId(Long userId, Pageable pageable);
    @Modifying
    @Transactional
    @Query("DELETE FROM Task ef WHERE ef.event.eventId = :eventId")
    void deleteTaskByEvent_EventId(@Param("eventId") Long id);

    @Query("SELECT t FROM Task t JOIN t.event e WHERE e.eventName LIKE %:eventName%")
    Page<Task> getTaskByEvent_EventName(@Param("eventName") String eventName, Pageable pageable);
}
