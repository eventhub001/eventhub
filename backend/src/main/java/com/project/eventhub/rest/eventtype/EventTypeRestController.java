package com.project.eventhub.rest.eventtype;

import com.project.eventhub.logic.entity.event.EventTypeRepository;
import com.project.eventhub.logic.entity.eventtype.EventType;
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
@RequestMapping("/event-types")
public class EventTypeRestController {

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @GetMapping
    public ResponseEntity<?> getAllEventTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page-1, size);
        Page<EventType> eventTypesPage = eventTypeRepository.findAll(pageable);

        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(eventTypesPage.getTotalPages());
        meta.setTotalElements(eventTypesPage.getTotalElements());
        meta.setPageNumber(eventTypesPage.getNumber());
        meta.setPageSize(eventTypesPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Event types retrieved successfully",
                eventTypesPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }

    @PostMapping
    public EventType addEventType(@RequestBody EventType eventType) {
        return eventTypeRepository.save(eventType);
    }

    @GetMapping("/{id}")
    public EventType getEventTypeById(@PathVariable Long id) {
        return eventTypeRepository.findById(id).orElseThrow(() -> new RuntimeException("Event type not found"));
    }

    @PutMapping("/{id}")
    public EventType updateEventType(@PathVariable Long id, @RequestBody EventType eventType) {
        return eventTypeRepository.findById(id)
                .map(existingEventType -> {
                    existingEventType.setEventTypeName(eventType.getEventTypeName());
                    return eventTypeRepository.save(existingEventType);
                })
                .orElseGet(() -> {
                    eventType.setEventTypeId(id);
                    return eventTypeRepository.save(eventType);
                });
    }

    @DeleteMapping("/{id}")
    public void deleteEventType(@PathVariable Long id) {
        eventTypeRepository.deleteById(id);
    }
}
