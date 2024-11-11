package com.project.eventhub.logic.entity.formtemplatetask;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.tasktemplate.TaskTemplate;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "event_task_template")
public class EventTaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_task_template_id")
    private Long taskTemplateId;

    @ManyToOne
    @JoinColumn(name = "task_template_id", nullable = false)
    private TaskTemplate taskTemplate; // Assuming you have a TaskTemplate entity defined

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
    @Column(name = "task_description")
    private String taskDescription;

    // Getters and Setters
    public Long getTaskTemplateId() {
        return taskTemplateId;
    }

    public void setTaskTemplateId(Long taskTemplateId) {
        this.taskTemplateId = taskTemplateId;
    }

    public TaskTemplate getTaskTemplate() {
        return taskTemplate;
    }

    public void setTaskTemplate(TaskTemplate taskTemplate) {
        this.taskTemplate = taskTemplate;
    }


    public String getTaskDescription() {
        return taskDescription;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }
}
