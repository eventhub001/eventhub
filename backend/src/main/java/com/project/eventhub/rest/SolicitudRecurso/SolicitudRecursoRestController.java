package com.project.eventhub.rest.SolicitudRecurso;

import com.project.eventhub.logic.entity.SolicitudRecurso.SolicitudRecurso;
import com.project.eventhub.logic.entity.SolicitudRecurso.SolicitudRecursoRepository;
import com.project.eventhub.logic.entity.VendorService.VendorServiceRepository;
import com.project.eventhub.logic.entity.VendorService.Vendor_service;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import com.project.eventhub.logic.http.GlobalResponseHandler;
import com.project.eventhub.logic.http.Meta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudRecursoRestController {

    @Autowired
    private SolicitudRecursoRepository solicitudRecursoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VendorServiceRepository vendorServiceRepository;

    @GetMapping
    public ResponseEntity<?> getAllSolicitudes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SolicitudRecurso> solicitudPage = solicitudRecursoRepository.findAll(pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(solicitudPage.getTotalPages());
        meta.setTotalElements(solicitudPage.getTotalElements());
        meta.setPageNumber(solicitudPage.getNumber() + 1);
        meta.setPageSize(solicitudPage.getSize());

        return new GlobalResponseHandler().handleResponse("Solicitudes retrieved successfully",
                solicitudPage.getContent(), HttpStatus.OK, meta);
    }

    @GetMapping("/user/{userId}/solicitudes")
    public ResponseEntity<?> getAllbyUserSolicitudes(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Optional<User> foundUser = userRepository.findById(userId);

        if (foundUser.isPresent()) {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<SolicitudRecurso> solicitudPage = solicitudRecursoRepository.findAll(pageable);
            Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
            meta.setTotalPages(solicitudPage.getTotalPages());
            meta.setTotalElements(solicitudPage.getTotalElements());
            meta.setPageNumber(solicitudPage.getNumber() + 1);
            meta.setPageSize(solicitudPage.getSize());

            return new GlobalResponseHandler().handleResponse("Solicitudes retrieved successfully",
                    solicitudPage.getContent(), HttpStatus.OK, meta);

        } else {
            return new GlobalResponseHandler().handleResponse("User Id " + userId + " not found",
                    HttpStatus.NOT_FOUND, request);
        }
    }



    @PostMapping
    public SolicitudRecurso createSolicitud(@RequestBody SolicitudRecurso solicitud) {
        // Recuperar y asociar el evento
        if (solicitud.getEvent() != null && solicitud.getEvent().getEventId() != null) {
            Event event = eventRepository.findById(solicitud.getEvent().getEventId())
                    .orElseThrow(() -> new IllegalArgumentException("El evento no existe."));
            solicitud.setEvent(event);
        }

        // Recuperar y asociar el servicio del proveedor
        if (solicitud.getVendor_service() != null && solicitud.getVendor_service().getId() != null) {
            Vendor_service vendorService = vendorServiceRepository.findById(solicitud.getVendor_service().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El servicio del proveedor no existe."));
            solicitud.setVendor_service(vendorService);
        }

        // Recuperar y asociar el usuario
        if (solicitud.getUser() != null && solicitud.getUser().getId() != null) {
            User user = userRepository.findById(solicitud.getUser().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El usuario no existe."));
            solicitud.setUser(user);
        }

        // Guardar la cotización
        return solicitudRecursoRepository.save(solicitud);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSolicitud(@PathVariable Long id, @RequestBody SolicitudRecurso solicitudDetails, HttpServletRequest request) {
        SolicitudRecurso solicitud = solicitudRecursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setEstado(solicitudDetails.getEstado());
        solicitud.setFechaEvento(solicitudDetails.getFechaEvento());
        solicitud.setHoraEvento(solicitudDetails.getHoraEvento());
        solicitud.setCantidad_solicitada(solicitudDetails.getCantidad_solicitada());

        SolicitudRecurso updatedSolicitud = solicitudRecursoRepository.save(solicitud);

        return new GlobalResponseHandler().handleResponse("Solicitud updated successfully",
                updatedSolicitud, HttpStatus.OK, new Meta(request.getMethod(), request.getRequestURL().toString()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSolicitud(@PathVariable Long id, HttpServletRequest request) {
        Optional<SolicitudRecurso> solicitud = solicitudRecursoRepository.findById(id);

        if (solicitud.isPresent()) {
            solicitudRecursoRepository.deleteById(id);
            return new GlobalResponseHandler().handleResponse("Solicitud deleted successfully",
                    HttpStatus.NO_CONTENT, request);
        } else {
            return new GlobalResponseHandler().handleResponse("Solicitud not found",
                    HttpStatus.NOT_FOUND, request);
        }
    }
}
