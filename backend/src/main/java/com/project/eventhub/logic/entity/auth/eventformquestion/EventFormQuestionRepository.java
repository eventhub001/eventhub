package com.project.eventhub.logic.entity.auth.eventformquestion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventFormQuestionRepository extends JpaRepository<EventFormQuestion, Long> {
    // You can define custom query methods here if needed
}
