package com.project.eventhub.rest.tasktemplate;

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

import java.util.Optional;

@RestController
@RequestMapping("/task-templates")
public class TaskTemplateController {

    @Autowired
    private TaskTemplateRepository taskTemplateRepository;

    @GetMapping
    public ResponseEntity<?> getAllTaskTemplates(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);  // Adjust for 0-based index
        Page<TaskTemplate> taskTemplatePage = taskTemplateRepository.findAll(pageable);

        // Create meta data
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(taskTemplatePage.getTotalPages());
        meta.setTotalElements(taskTemplatePage.getTotalElements());
        meta.setPageNumber(taskTemplatePage.getNumber() + 1);  // Adjust page number to be 1-based
        meta.setPageSize(taskTemplatePage.getSize());

        // Return the response with data and meta
        return new GlobalResponseHandler().handleResponse(
                "Task templates retrieved successfully",
                taskTemplatePage.getContent(),
                HttpStatus.OK,
                meta
        );
    }
    @PostMapping
    public ResponseEntity<TaskTemplate> createTaskTemplate(@RequestBody TaskTemplate taskTemplate) {
        TaskTemplate savedTaskTemplate = taskTemplateRepository.save(taskTemplate);
        return ResponseEntity.ok(savedTaskTemplate);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTemplate> getTaskTemplateById(@PathVariable Long id) {
        Optional<TaskTemplate> taskTemplateOptional = taskTemplateRepository.findById(id);
        if (taskTemplateOptional.isPresent()) {
            return ResponseEntity.ok(taskTemplateOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskTemplate> updateTaskTemplate(@PathVariable Long id, @RequestBody TaskTemplate taskTemplate) {
        Optional<TaskTemplate> taskTemplateOptional = taskTemplateRepository.findById(id);
        if (taskTemplateOptional.isPresent()) {
            TaskTemplate existingTaskTemplate = taskTemplateOptional.get();
            existingTaskTemplate.setTaskTemplateName(taskTemplate.getTaskTemplateName());
            existingTaskTemplate.setTaskTemplateDescription(taskTemplate.getTaskTemplateDescription());
            // Update other fields as needed
            taskTemplateRepository.save(existingTaskTemplate);
            return ResponseEntity.ok(existingTaskTemplate);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTaskTemplate(@PathVariable Long id) {
        taskTemplateRepository.deleteById(id);
        return ResponseEntity.noContent().build();

    }
}
