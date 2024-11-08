package com.project.eventhub.logic.entity.formtemplatetask;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventTaskTemplateRepository extends JpaRepository<EventTaskTemplate, Long> {
    // You can define custom query methods here if needed
}
