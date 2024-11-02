package com.project.eventhub.logic.entity.task;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.eventhub.logic.entity.event.Event;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Table(name = "task")
public class Task {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer id;

        @Column(name = "task_name")
        private String taskName;

        @Column(length = 255)
        private String description;



        @CreationTimestamp
        @Column(name = "creation_date", updatable = false)
        private Date creationDate;

        @UpdateTimestamp
        @Column(name = "update_date")
        private Date updateDate;

        @Column(name = "due_date")
        private Date dueDate;

        @Column
        private String priority;

        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "event_id", nullable = false)
        private Event event;

    public Task() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }



    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

}
