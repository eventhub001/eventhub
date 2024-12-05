package com.project.eventhub.rest.requestresource;

import com.project.eventhub.logic.entity.email.EmailService;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.requestresource.RequestResource;
import com.project.eventhub.logic.entity.requestresource.RequestResourceRepository;
import com.project.eventhub.logic.entity.status.Status;
import com.project.eventhub.logic.entity.status.StatusRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import com.project.eventhub.logic.entity.vendorservice.VendorServiceRepository;
import com.project.eventhub.logic.entity.vendorservice.Vendor_service;
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
public class RequestResourceRestController {
    @Autowired
    private RequestResourceRepository requestResourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VendorServiceRepository vendorServiceRepository;
    @Autowired
    private com.project.eventhub.logic.entity.status.StatusRepository StatusRepository;

    private EmailService emailService;

    public RequestResourceRestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<?> getAllSolicitudes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<RequestResource> solicitudPage = requestResourceRepository.findAll(pageable);
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
            Page<RequestResource> solicitudPage = requestResourceRepository.findAll(pageable);
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
    public RequestResource createSolicitud(@RequestBody RequestResource solicitud) {
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

        Status status = StatusRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("El estado no existe."));
        solicitud.setStatus(status);

        // Recuperar y asociar el usuario
        if (solicitud.getUser() != null && solicitud.getUser().getId() != null) {
            User user = userRepository.findById(solicitud.getUser().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El usuario no existe."));
            solicitud.setUser(user);
        }

        // Guardar la cotización
        return requestResourceRepository.save(solicitud);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSolicitud(@PathVariable Long id, @RequestBody RequestResource solicitudDetails, HttpServletRequest request) {
        RequestResource solicitud = requestResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        Vendor_service vendorService = vendorServiceRepository.findById(solicitudDetails.getVendor_service().getId())
                .orElseThrow(() -> new RuntimeException("Servicio de proveedor no encontrado"));
        solicitud.setStatus(solicitudDetails.getStatus());
        solicitud.setRequested_quantity(solicitudDetails.getRequested_quantity());
        solicitud.setVendor_service(vendorService);
        solicitud.setEvent(solicitudDetails.getEvent());

        RequestResource updatedSolicitud = requestResourceRepository.save(solicitud);

        return new GlobalResponseHandler().handleResponse("Solicitud updated successfully",
                updatedSolicitud, HttpStatus.OK, new Meta(request.getMethod(), request.getRequestURL().toString()));
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Status status, HttpServletRequest request) {
        RequestResource solicitud = requestResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setStatus(status);

        RequestResource updatedSolicitud = requestResourceRepository.save(solicitud);

        Status status1 = StatusRepository.findById(updatedSolicitud.getStatus().getId())
                .orElseThrow(() -> new IllegalArgumentException("El estado no existe."));
        String subject = "Cambio de estado de solicitud";
        String text = "La solicitud del " + solicitud.getUser().getName() + solicitud.getUser().getLastname() + " ha cambiado de estado a " + status1.getStatus();
        String email = solicitud.getUser().getEmail();

        // Enviar el correo con el token
        emailService.sendEmail("eventhub18@gmail.com", subject, text);

        return new GlobalResponseHandler().handleResponse("Solicitud updated successfully",
                updatedSolicitud, HttpStatus.OK, new Meta(request.getMethod(), request.getRequestURL().toString()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSolicitud(@PathVariable Long id, HttpServletRequest request) {
        Optional<RequestResource> solicitud = requestResourceRepository.findById(id);

        if (solicitud.isPresent()) {
            requestResourceRepository.deleteById(id);
            return new GlobalResponseHandler().handleResponse("Solicitud deleted successfully",
                    HttpStatus.NO_CONTENT, request);
        } else {
            return new GlobalResponseHandler().handleResponse("Solicitud not found",
                    HttpStatus.NOT_FOUND, request);
        }
    }
}
