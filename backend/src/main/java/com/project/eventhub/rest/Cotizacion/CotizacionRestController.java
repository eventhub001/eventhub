package com.project.eventhub.rest.Cotizacion;

import com.project.eventhub.logic.entity.VendorService.VendorServiceRepository;
import com.project.eventhub.logic.entity.VendorService.Vendor_service;
import com.project.eventhub.logic.entity.cotizacion.Cotizacion;
import com.project.eventhub.logic.entity.cotizacion.CotizacionRepository;
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
@RequestMapping("/api/cotizaciones")
public class CotizacionRestController {

    @Autowired
    private CotizacionRepository cotizacionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VendorServiceRepository vendorServiceRepository;

    @GetMapping
    public ResponseEntity<?> getAllCotizaciones(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Cotizacion> cotizacionPage = cotizacionRepository.findAll(pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(cotizacionPage.getTotalPages());
        meta.setTotalElements(cotizacionPage.getTotalElements());
        meta.setPageNumber(cotizacionPage.getNumber() + 1);
        meta.setPageSize(cotizacionPage.getSize());

        return new GlobalResponseHandler().handleResponse("Cotizaciones retrieved successfully",
                cotizacionPage.getContent(), HttpStatus.OK, meta);
    }

    @GetMapping("/user/{userId}/cotizaciones")
    public ResponseEntity<?> getAllbyUserCotizaciones(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Optional<User> foundUser = userRepository.findById(userId);

        if (foundUser.isPresent()) {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Cotizacion> cotizacionPage = cotizacionRepository.findAll(pageable);
            Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
            meta.setTotalPages(cotizacionPage.getTotalPages());
            meta.setTotalElements(cotizacionPage.getTotalElements());
            meta.setPageNumber(cotizacionPage.getNumber() + 1);
            meta.setPageSize(cotizacionPage.getSize());

            return new GlobalResponseHandler().handleResponse("Cotizaciones retrieved successfully",
                    cotizacionPage.getContent(), HttpStatus.OK, meta);
        } else {
            return new GlobalResponseHandler().handleResponse("User Id " + userId + " not found",
                    HttpStatus.NOT_FOUND, request);
        }
    }

    @PostMapping
    public Cotizacion createCotizacion(@RequestBody Cotizacion cotizacion) {
        // Recuperar y asociar el evento
        if (cotizacion.getEvent() != null && cotizacion.getEvent().getEventId() != null) {
            Event event = eventRepository.findById(cotizacion.getEvent().getEventId())
                    .orElseThrow(() -> new IllegalArgumentException("El evento no existe."));
            cotizacion.setEvent(event);
        }

        // Recuperar y asociar el servicio del proveedor
        if (cotizacion.getVendor_service() != null && cotizacion.getVendor_service().getId() != null) {
            Vendor_service vendorService = vendorServiceRepository.findById(cotizacion.getVendor_service().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El servicio del proveedor no existe."));
            cotizacion.setVendor_service(vendorService);
        }

        // Recuperar y asociar el usuario
        if (cotizacion.getUser() != null && cotizacion.getUser().getId() != null) {
            User user = userRepository.findById(cotizacion.getUser().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El usuario no existe."));
            cotizacion.setUser(user);
        }

        // Guardar la cotización
        return cotizacionRepository.save(cotizacion);
    }


    @PutMapping("/{id}")
    public Cotizacion updateCotizacion(@PathVariable Long id, @RequestBody Cotizacion cotizacionDetails) {
        Cotizacion cotizacion = cotizacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cotizacion no encontrada"));
        cotizacion.setEstado(cotizacionDetails.getEstado());
        cotizacion.setMontoCotizado(cotizacionDetails.getMontoCotizado());
        cotizacion.setCantidadRecurso(cotizacionDetails.getCantidadRecurso());
        cotizacion.setVendor_service(cotizacionDetails.getVendor_service());
        cotizacion.setEvent(cotizacionDetails.getEvent());
        return cotizacionRepository.save(cotizacion);
    }

    @DeleteMapping("/{id}")
    public void deleteCotizacion(@PathVariable Long id) {
        cotizacionRepository.deleteById(id);
    }
}
