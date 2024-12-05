package com.project.eventhub.logic.entity.cotizacion;

import com.project.eventhub.logic.entity.vendorservice.Vendor_service;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

@Entity
public class Cotizacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Event  event;
    @ManyToOne
    private Vendor_service vendor_service;
    private Double montoCotizado;
    private Integer cantidadRecurso;

    @ManyToOne
    private User user; // Relación con User (Planificador)

    private String estado; // "Enviada", "Aceptada", "Rechazada"

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Double getMontoCotizado() {
        return montoCotizado;
    }

    public void setMontoCotizado(Double montoCotizado) {
        this.montoCotizado = montoCotizado;
    }

    public Integer getCantidadRecurso() {
        return cantidadRecurso;
    }

    public void setCantidadRecurso(Integer cantidadRecurso) {
        this.cantidadRecurso = cantidadRecurso;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}