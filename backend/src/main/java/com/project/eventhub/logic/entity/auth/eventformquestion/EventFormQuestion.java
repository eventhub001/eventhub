package com.project.eventhub.logic.entity.auth.eventformquestion;

import jakarta.persistence.*;

@Entity
@Table(name = "event_form_question")
public class EventFormQuestion {

    private String question;

    private String nnControlName;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getNnControlName() {
        return nnControlName;
    }

    public void setNnControlName(String nnControlName) {
        this.nnControlName = nnControlName;
    }
}
