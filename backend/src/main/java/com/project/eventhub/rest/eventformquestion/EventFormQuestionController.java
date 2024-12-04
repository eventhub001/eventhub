package com.project.eventhub.rest.eventformquestion;

import com.project.eventhub.logic.entity.eventformquestion.EventFormQuestion;
import com.project.eventhub.logic.entity.eventformquestion.EventFormQuestionRepository;
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
@RequestMapping("/event-form-questions")
public class EventFormQuestionController {

    @Autowired
    private EventFormQuestionRepository eventFormQuestionRepository;

    @GetMapping
    public ResponseEntity<?> getAllEventFormQuestions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);  // Adjust for 0-based index
        Page<EventFormQuestion> eventFormQuestionPage = eventFormQuestionRepository.findAll(pageable);

        // Create meta data
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(eventFormQuestionPage.getTotalPages());
        meta.setTotalElements(eventFormQuestionPage.getTotalElements());
        meta.setPageNumber(eventFormQuestionPage.getNumber() + 1);  // Adjust page number to be 1-based
        meta.setPageSize(eventFormQuestionPage.getSize());

        // Return the response with data and meta
        return new GlobalResponseHandler().handleResponse(
                "Event form questions retrieved successfully",
                eventFormQuestionPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }

    @PostMapping
    public ResponseEntity<EventFormQuestion> createEventFormQuestion(@RequestBody EventFormQuestion question) {
        EventFormQuestion savedQuestion = eventFormQuestionRepository.save(question);
        return ResponseEntity.ok(savedQuestion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventFormQuestion> getEventFormQuestionById(@PathVariable Long id) {
        Optional<EventFormQuestion> questionOptional = eventFormQuestionRepository.findById(id);
        return questionOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventFormQuestion> updateEventFormQuestion(@PathVariable Long id, @RequestBody EventFormQuestion question) {
        Optional<EventFormQuestion> questionOptional = eventFormQuestionRepository.findById(id);
        if (questionOptional.isPresent()) {
            EventFormQuestion existingQuestion = questionOptional.get();
            existingQuestion.setQuestion(question.getQuestion());
            eventFormQuestionRepository.save(existingQuestion);
            return ResponseEntity.ok(existingQuestion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEventFormQuestion(@PathVariable Long id) {
        if (eventFormQuestionRepository.existsById(id)) {
            eventFormQuestionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
