package com.project.eventhub.logic.entity.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Integer> {

    Page<Task> getTaskByEvent_EventId(Long eventId, Pageable pageable);


}
