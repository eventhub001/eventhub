package com.project.eventhub.logic.entity.requestresource;

import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.status.Status;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.vendorservice.Vendor_service;
import jakarta.persistence.*;

@Entity
public class RequestResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Vendor_service vendor_service;

    @ManyToOne
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private Event event;

    @ManyToOne
    private Status status;
    private String dateRequest;
    private Integer requested_quantity;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vendor_service getVendor_service() {
        return vendor_service;
    }

    public void setVendor_service(Vendor_service vendor_service) {
        this.vendor_service = vendor_service;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getDateRequest() {
        return dateRequest;
    }

    public void setDateRequest(String dateRequest) {
        this.dateRequest = dateRequest;
    }

    public Integer getRequested_quantity() {
        return requested_quantity;
    }

    public void setRequested_quantity(Integer requested_quantity) {
        this.requested_quantity = requested_quantity;
    }
}
