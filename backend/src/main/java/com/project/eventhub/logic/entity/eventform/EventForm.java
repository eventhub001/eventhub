package com.project.eventhub.logic.entity.eventform;
import com.project.eventhub.logic.entity.auth.eventformquestion.EventFormQuestion;
import com.project.eventhub.logic.entity.event.Event;
import jakarta.persistence.*;

import java.util.ArrayList;

@Entity
@Table(name = "event_form")
public class EventForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "taskform_id")
    private Long taskFormId;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "event_form_question_id", nullable = false)
    private EventFormQuestion question;

    @Column(name = "answer")
    private String answer;

    // Getters and Setters
    public Long getTaskFormId() {
        return taskFormId;
    }

    public void setTaskFormId(Long taskFormId) {
        this.taskFormId = taskFormId;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public EventFormQuestion getQuestion() {
        return question;
    }

    public void setQuestion(EventFormQuestion question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
