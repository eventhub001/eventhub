package com.project.eventhub.rest.quote;

import com.project.eventhub.logic.entity.email.EmailService;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.quote.Quote;
import com.project.eventhub.logic.entity.quote.QuoteRepository;
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
@RequestMapping("/api/cotizaciones")
public class QuoteRestController {
    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VendorServiceRepository vendorServiceRepository;
    @Autowired
    private StatusRepository StatusRepository;
    private EmailService emailService;

    public QuoteRestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<?> getAllCotizaciones(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Quote> cotizacionPage = quoteRepository.findAll(pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(cotizacionPage.getTotalPages());
        meta.setTotalElements(cotizacionPage.getTotalElements());
        meta.setPageNumber(cotizacionPage.getNumber() + 1);
        meta.setPageSize(cotizacionPage.getSize());

        return new GlobalResponseHandler().handleResponse("Cotizaciones retrieved successfully",
                cotizacionPage.getContent(), HttpStatus.OK, meta);
    }

    @GetMapping("/user/{userId}/quotes")
    public ResponseEntity<?> getAllbyUserCotizaciones(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Optional<User> foundUser = userRepository.findById(userId);

        if (foundUser.isPresent()) {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Quote> cotizacionPage = quoteRepository.findAll(pageable);
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
    public Quote createCotizacion(@RequestBody Quote quote) {
        // Recuperar y asociar el evento
        if (quote.getEvent() != null && quote.getEvent().getEventId() != null) {
            Event event = eventRepository.findById(quote.getEvent().getEventId())
                    .orElseThrow(() -> new IllegalArgumentException("El evento no existe."));
            quote.setEvent(event);
        }

        // Recuperar y asociar el servicio del proveedor
        if (quote.getVendor_service() != null && quote.getVendor_service().getId() != null) {
            Vendor_service vendorService = vendorServiceRepository.findById(quote.getVendor_service().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El servicio del proveedor no existe."));
            quote.setVendor_service(vendorService);
        }

        Status status = StatusRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("El estado no existe."));
        quote.setStatus(status);

        // Recuperar y asociar el usuario
        if (quote.getUser() != null && quote.getUser().getId() != null) {
            User user = userRepository.findById(quote.getUser().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El usuario no existe."));
            quote.setUser(user);
        }

        // Guardar la cotización
        return quoteRepository.save(quote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCotizacion(@PathVariable Long id, @RequestBody Quote quoteDetails, HttpServletRequest request) {
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cotizacion no encontrada"));
        Vendor_service vendorService = vendorServiceRepository.findById(quoteDetails.getVendor_service().getId())
                .orElseThrow(() -> new RuntimeException("Servicio de proveedor no encontrado"));
        quote.setStatus(quoteDetails.getStatus());
        quote.setQuoted_amount(quoteDetails.getQuoted_amount());
        quote.setQuantityResource(quoteDetails.getQuantityResource());
        quote.setVendor_service(vendorService);
        quote.setEvent(quoteDetails.getEvent());

        Quote updateQuote = quoteRepository.save(quote);

        return new GlobalResponseHandler().handleResponse("Cotizacion updated successfully",
                updateQuote, HttpStatus.OK, new Meta(request.getMethod(), request.getRequestURL().toString()));
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Status status, HttpServletRequest request) {
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        quote.setStatus(status);

        Quote updatedQuote = quoteRepository.save(quote);

        Status status1 = StatusRepository.findById(updatedQuote.getStatus().getId())
                .orElseThrow(() -> new IllegalArgumentException("El estado no existe."));
        String subject = "Cambio de estado de solicitud";
        String text = "La solicitud del " + quote.getUser().getName() + quote.getUser().getLastname() + " ha cambiado de estado a " + status1.getStatus();
        String email = quote.getUser().getEmail();

        // Enviar el correo con el token
        emailService.sendEmail("eventhub18@gmail.com", subject, text);

        return new GlobalResponseHandler().handleResponse("Cotizacion updated successfully",
                updatedQuote, HttpStatus.OK, new Meta(request.getMethod(), request.getRequestURL().toString()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSolicitud(@PathVariable Long id, HttpServletRequest request) {
        Optional<Quote> cotizacion = quoteRepository.findById(id);

        if (cotizacion.isPresent()) {
            quoteRepository.deleteById(id);
            return new GlobalResponseHandler().handleResponse("Cotizacion deleted successfully",
                    HttpStatus.NO_CONTENT, request);
        } else {
            return new GlobalResponseHandler().handleResponse("Cotizacion not found",
                    HttpStatus.NOT_FOUND, request);
        }
    }
}
