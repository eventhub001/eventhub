package com.project.eventhub.logic.entity.eventtype;

import com.project.eventhub.logic.entity.eventtype.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventTypeRepository extends JpaRepository<EventType, Long> {
}
