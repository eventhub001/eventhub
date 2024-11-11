package com.project.eventhub.logic.entity.tasktemplate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {
    // You can define custom query methods here if needed
}
