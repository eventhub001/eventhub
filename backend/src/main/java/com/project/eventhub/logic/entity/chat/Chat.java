package com.project.eventhub.logic.entity.chat;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.project.eventhub.logic.entity.eventtype.EventType;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String message;
    private Integer roomId;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Chat() {}

    public Chat(String message, User user, Integer roomId, LocalDateTime timestamp) {
        this.message = message;
        this.user = user;
        this.roomId = roomId;
        this.timestamp = timestamp;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
