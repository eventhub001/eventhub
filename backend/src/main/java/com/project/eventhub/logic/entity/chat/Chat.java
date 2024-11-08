package com.project.eventhub.logic.entity.chat;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.project.eventhub.logic.entity.eventtype.EventType;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;
@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String message;


    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Chat() {}

    public Chat(String message, User user) {
        this.message = message;
        this.user = user;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
