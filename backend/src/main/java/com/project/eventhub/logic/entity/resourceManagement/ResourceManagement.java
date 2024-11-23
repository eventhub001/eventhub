package com.project.eventhub.logic.entity.resourceManagement;

import com.project.eventhub.logic.entity.VendorService.Vendor_service;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

@Entity
public class ResourceManagement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Vendor_service vendor_service;

    @ManyToOne
    private Event event;

    private String state; // "Pending", "Approved", "Rejected", "Canceled"
    private String requestDate;








}
