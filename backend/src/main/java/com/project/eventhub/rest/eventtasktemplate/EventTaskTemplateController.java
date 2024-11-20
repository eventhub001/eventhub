package com.project.eventhub.rest.eventtasktemplate;

import com.project.eventhub.logic.entity.formtemplatetask.EventTaskTemplate;
import com.project.eventhub.logic.entity.formtemplatetask.EventTaskTemplateRepository;
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
@RequestMapping("/event-task-templates")
public class EventTaskTemplateController {

    @Autowired
    private EventTaskTemplateRepository userTemplateTaskRepository;

    @GetMapping
    public ResponseEntity<?> getAllUserTemplateTasks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);  // Adjust for 0-based index
        Page<EventTaskTemplate> userTemplateTaskPage = userTemplateTaskRepository.findAll(pageable);

        // Create meta data
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(userTemplateTaskPage.getTotalPages());
        meta.setTotalElements(userTemplateTaskPage.getTotalElements());
        meta.setPageNumber(userTemplateTaskPage.getNumber() + 1);  // Adjust page number to be 1-based
        meta.setPageSize(userTemplateTaskPage.getSize());

        // Return the response with data and meta
        return new GlobalResponseHandler().handleResponse(
                "User template tasks retrieved successfully",
                userTemplateTaskPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }


    @PostMapping
    public ResponseEntity<EventTaskTemplate> createUserTemplateTask(@RequestBody EventTaskTemplate userTemplateTask) {
        EventTaskTemplate savedUserTemplateTask = userTemplateTaskRepository.save(userTemplateTask);
        System.out.println("Plantilla guardada de manera exitosa");
        return ResponseEntity.ok(savedUserTemplateTask);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventTaskTemplate> getUserTemplateTaskById(@PathVariable Long id) {
        Optional<EventTaskTemplate> userTemplateTaskOptional = userTemplateTaskRepository.findById(id);
        if (userTemplateTaskOptional.isPresent()) {
            return ResponseEntity.ok(userTemplateTaskOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventTaskTemplate> updateUserTemplateTask(@PathVariable Long id, @RequestBody EventTaskTemplate userTemplateTask) {
        Optional<EventTaskTemplate> userTemplateTaskOptional = userTemplateTaskRepository.findById(id);
        if (userTemplateTaskOptional.isPresent()) {
            EventTaskTemplate existingUserTemplateTask = userTemplateTaskOptional.get();
            existingUserTemplateTask.setTaskTemplate(userTemplateTask.getTaskTemplate());
            existingUserTemplateTask.setEvent(userTemplateTask.getEvent());
            existingUserTemplateTask.setTaskDescription(userTemplateTask.getTaskDescription());
            // Update other fields as needed
            userTemplateTaskRepository.save(existingUserTemplateTask);
            return ResponseEntity.ok(existingUserTemplateTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserTemplateTask(@PathVariable Long id) {
        userTemplateTaskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
