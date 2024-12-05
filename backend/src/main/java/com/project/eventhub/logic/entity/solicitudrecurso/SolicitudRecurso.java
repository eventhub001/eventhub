package com.project.eventhub.logic.entity.solicitudrecurso;

import com.project.eventhub.logic.entity.vendorservice.Vendor_service;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;


@Entity
public class SolicitudRecurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Vendor_service vendor_service;

    @ManyToOne
    private User user; // Relación con User (Planificador)

    private String estado; // "Pendiente", "Aprobada", "Rechazada", "Cancelada"
    private String fechaSolicitud;
    private String fechaEvento;

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

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(String fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public String getFechaEvento() {
        return fechaEvento;
    }

    public void setFechaEvento(String fechaEvento) {
        this.fechaEvento = fechaEvento;
    }
}