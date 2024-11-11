package com.project.eventhub.logic.entity.tasktemplate;

import jakarta.persistence.*;

@Entity
@Table(name = "task_template")
public class TaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tasktemplate_id")
    private Long taskTemplateId;

    @Column(name = "tasktemplate_name", nullable = false)
    private String taskTemplateName;

    @Column(name = "tasktemplate_descripcion", nullable = false)
    private String taskTemplateDescription;

    // Getters and Setters
    public Long getTaskTemplateId() {
        return taskTemplateId;
    }

    public void setTaskTemplateId(Long taskTemplateId) {
        this.taskTemplateId = taskTemplateId;
    }

    public String getTaskTemplateName() {
        return taskTemplateName;
    }

    public void setTaskTemplateName(String taskTemplateName) {
        this.taskTemplateName = taskTemplateName;
    }

    public String getTaskTemplateDescription() {
        return taskTemplateDescription;
    }

    public void setTaskTemplateDescription(String tastkTemplateDescriptiion) {
        this.taskTemplateDescription = tastkTemplateDescriptiion;
    }
}
