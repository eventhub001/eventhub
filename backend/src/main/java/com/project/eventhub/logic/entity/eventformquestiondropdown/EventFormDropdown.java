package com.project.eventhub.logic.entity.eventformquestiondropdown;

import com.project.eventhub.logic.entity.eventformquestion.EventFormQuestion;
import jakarta.persistence.*;

@Entity
@Table(name = "event_type")
public class EventFormDropdown {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_question_id", nullable = false)
    private EventFormQuestion eventFormQuestion;

    @Column(name = "option")
    private String option;
}
