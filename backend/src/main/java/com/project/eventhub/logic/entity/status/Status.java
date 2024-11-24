package com.project.eventhub.logic.entity.status;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
@Entity
public class Status {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String status; // Ejemplo: "PENDIENTE", "APROBADA", etc.

    @Column(nullable = false)
    private String descripcion; // Ejemplo: "Pendiente de aprobación", "Solicitud aprobada"

    // Getters y setters


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
