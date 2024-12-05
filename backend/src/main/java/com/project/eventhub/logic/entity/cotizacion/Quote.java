package com.project.eventhub.logic.entity.cotizacion;

import com.project.eventhub.logic.entity.vendorservice.Vendor_service;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.status.Status;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

@Entity
public class Quote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private User user;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private Event event;
    @ManyToOne
    private Vendor_service vendor_service;
    @ManyToOne
    private Status status;
    private Double quoted_amount;
    private Integer quantityResource;

    // Getters and Setters


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Vendor_service getVendor_service() {
        return vendor_service;
    }

    public void setVendor_service(Vendor_service vendor_service) {
        this.vendor_service = vendor_service;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Double getQuoted_amount() {
        return quoted_amount;
    }

    public void setQuoted_amount(Double quoted_amount) {
        this.quoted_amount = quoted_amount;
    }

    public Integer getQuantityResource() {
        return quantityResource;
    }

    public void setQuantityResource(Integer quantityResource) {
        this.quantityResource = quantityResource;
    }
}