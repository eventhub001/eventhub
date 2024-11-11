package com.project.eventhub.rest.eventform;
import com.project.eventhub.logic.entity.eventform.EventForm;
import com.project.eventhub.logic.entity.eventform.EventFormRepository;
import com.project.eventhub.logic.entity.tasktemplate.TaskTemplate;
import com.project.eventhub.logic.entity.tasktemplate.TaskTemplateRepository;
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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/event-forms")
public class EventFormController {

    @Autowired
    private EventFormRepository eventFormRepository;

    @GetMapping
    public ResponseEntity<?> getAllEventForms(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);  // Adjust for 0-based index
        Page<EventForm> eventFormPage = eventFormRepository.findAll(pageable);

        // Create meta data
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(eventFormPage.getTotalPages());
        meta.setTotalElements(eventFormPage.getTotalElements());
        meta.setPageNumber(eventFormPage.getNumber() + 1);  // Adjust page number to be 1-based
        meta.setPageSize(eventFormPage.getSize());

        // Return the response with data and meta
        return new GlobalResponseHandler().handleResponse(
                "Event forms retrieved successfully",
                eventFormPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }

    @PostMapping
    public ResponseEntity<EventForm> createEventForm(@RequestBody EventForm eventForm) {
        EventForm savedEventForm = eventFormRepository.save(eventForm);
        return ResponseEntity.ok(savedEventForm);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventForm> getEventFormById(@PathVariable Long id) {
        Optional<EventForm> eventFormOptional = eventFormRepository.findById(id);
        if (eventFormOptional.isPresent()) {
            return ResponseEntity.ok(eventFormOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventForm> updateEventForm(@PathVariable Long id, @RequestBody EventForm eventForm) {
        Optional<EventForm> eventFormOptional = eventFormRepository.findById(id);
        if (eventFormOptional.isPresent()) {
            EventForm existingEventForm = eventFormOptional.get();
            existingEventForm.setQuestion(eventForm.getQuestion());
            existingEventForm.setAnswer(eventForm.getAnswer());
            // Update other fields as needed
            eventFormRepository.save(existingEventForm);
            return ResponseEntity.ok(existingEventForm);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEventForm(@PathVariable Long id) {
        eventFormRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}