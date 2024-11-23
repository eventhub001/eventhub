package com.project.eventhub.rest.event;

import com.project.eventhub.logic.entity.auth.AuthenticationService;
import com.project.eventhub.logic.entity.auth.JwtService;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.event.EventTypeRepository;
import com.project.eventhub.logic.entity.eventform.EventFormRepository;
import com.project.eventhub.logic.entity.formtemplatetask.EventTaskTemplateRepository;
import com.project.eventhub.logic.entity.rol.RoleEnum;
import com.project.eventhub.logic.entity.task.TaskRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import com.project.eventhub.logic.http.GlobalResponseHandler;
import com.project.eventhub.logic.http.Meta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.naming.AuthenticationException;
import javax.swing.text.html.Option;
import java.util.Optional;

@RestController
@RequestMapping("/events")
public class EventRestController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @Autowired
    private EventFormRepository eventFormRepository;

    @Autowired
    EventTaskTemplateRepository eventTaskTemplateRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;
    @GetMapping
    @PreAuthorize("hasAnyRole('Producer', 'Supplier', 'SUPER_ADMIN')")
    public ResponseEntity<?> getAllEvents(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) throws AuthenticationException {
        Pageable pageable = PageRequest.of(page-1, size);

        Page<Event> eventsPage = null;

        String token = authenticationService.getTokenFromAuthorationHeader(authorization);
        String userName = jwtService.extractUsername(token);
        Optional<User> user = userRepository.findByEmail(userName);

        if (user.isPresent()) {
            System.out.println(user.get().getRole().getName());
            if (user.get().getRole().getName() == RoleEnum.SUPER_ADMIN) {
                eventsPage = eventRepository.findAll(pageable);
                System.out.println(eventsPage.getContent().getFirst().getEventType());
            }

            else {
                eventsPage = eventRepository.findAllByUserId(user.get().getId(), pageable);
            }
        }

        else {
            throw new AuthenticationException("User not found. Please make sure to validate the token.");
        }
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(eventsPage.getTotalPages());
        meta.setTotalElements(eventsPage.getTotalElements());
        meta.setPageNumber(eventsPage.getNumber());
        meta.setPageSize(eventsPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Events retrieved successfully",
                eventsPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public Event addEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return eventRepository.findById(id)
                .map(existingEvent -> {
                    existingEvent.setUserId(event.getUserId());
                    existingEvent.setEventName(event.getEventName());
                    existingEvent.setEventType(event.getEventType());
                    return eventRepository.save(existingEvent);
                })
                .orElseGet(() -> {
                    event.setEventId(id);
                    return eventRepository.save(event);
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventFormRepository.deleteEventFormByEvent_EventId(id);
        taskRepository.deleteTaskByEvent_EventId(id);
        eventTaskTemplateRepository.deleteEventTaskTemplateByEvent_EventId(id);
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> searchByName(
            @RequestParam String search,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) throws AuthenticationException {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Event> eventsPage;

        // Extract token and user info
        String token = authenticationService.getTokenFromAuthorationHeader(authorization);
        String userName = jwtService.extractUsername(token);
        Optional<User> user = userRepository.findByEmail(userName);

        if (user.isPresent()) {
            RoleEnum role = user.get().getRole().getName();

            if (role == RoleEnum.SUPER_ADMIN) {
                eventsPage = eventRepository.findByNameContaining(search, pageable);
            } else {
                eventsPage = eventRepository.findByUserIdAndNameContaining(user.get().getId(), search, pageable);
            }
        } else {
            throw new AuthenticationException("User not found. Please make sure to validate the token.");
        }

        // Meta data for pagination
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(eventsPage.getTotalPages());
        meta.setTotalElements(eventsPage.getTotalElements());
        meta.setPageNumber(eventsPage.getNumber() + 1);
        meta.setPageSize(eventsPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Events retrieved successfully",
                eventsPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }
}
