package com.project.eventhub.rest.event;

import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.event.EventTypeRepository;
import com.project.eventhub.logic.http.GlobalResponseHandler;
import com.project.eventhub.logic.http.Meta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/events")
public class EventRestController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Event> eventsPage = eventRepository.findAll(pageable);

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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public void deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
    }
}
