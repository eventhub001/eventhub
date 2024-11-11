package com.project.eventhub.rest.SolicitudRecurso;

import com.project.eventhub.logic.entity.SolicitudRecurso.SolicitudRecurso;
import com.project.eventhub.logic.entity.SolicitudRecurso.SolicitudRecursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudRecursoRestController {

    @Autowired
    private SolicitudRecursoRepository solicitudRecursoRepository;

    @GetMapping
    public List<SolicitudRecurso> getAllSolicitudes() {
        return solicitudRecursoRepository.findAll();
    }

    @PostMapping
    public SolicitudRecurso createSolicitud(@RequestBody SolicitudRecurso solicitud) {
        return solicitudRecursoRepository.save(solicitud);
    }

    @PutMapping("/{id}")
    public SolicitudRecurso updateSolicitud(@PathVariable Long id, @RequestBody SolicitudRecurso solicitudDetails) {
        SolicitudRecurso solicitud = solicitudRecursoRepository.findById(id).orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        solicitud.setEstado(solicitudDetails.getEstado());
        return solicitudRecursoRepository.save(solicitud);
    }

    @DeleteMapping("/{id}")
    public void deleteSolicitud(@PathVariable Long id) {
        solicitudRecursoRepository.deleteById(id);
    }
}