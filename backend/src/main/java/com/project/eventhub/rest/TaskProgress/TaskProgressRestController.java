package com.project.eventhub.rest.TaskProgress;

import com.project.eventhub.logic.entity.TaskProgress.TaskProgress;
import com.project.eventhub.logic.entity.TaskProgress.TaskProgressRepository;
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

import java.util.Optional;

@RestController
@RequestMapping("/taskProgress")
public class TaskProgressRestController {
    @Autowired
    private TaskProgressRepository taskProgressRepository;



    @PostMapping
    public TaskProgress addTaskProgress(@RequestBody TaskProgress taskProgress) {
            return taskProgressRepository.save(taskProgress);
    }


    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllTaskProgress(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page-1, size);
        Page<TaskProgress> taskProgressesPage = taskProgressRepository.findAll(pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(taskProgressesPage.getTotalPages());
        meta.setTotalElements(taskProgressesPage.getTotalElements());
        meta.setPageNumber(taskProgressesPage.getNumber() + 1);
        meta.setPageSize(taskProgressesPage.getSize());

        return new GlobalResponseHandler().handleResponse("Task Progress retrieved successfully",
                taskProgressesPage.getContent(), HttpStatus.OK, meta);
    }



    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole( 'SUPER_ADMIN')")
    public TaskProgress updateTaskprogress(@PathVariable Integer id, @RequestBody TaskProgress taskprogress) {
        return taskProgressRepository.findById(id)
                .map(existingCategory -> {
                    Optional.ofNullable(taskprogress.getStatus()).ifPresent(existingCategory::setStatus);
                    Optional.ofNullable(taskprogress.getChangeDate()).ifPresent(existingCategory::setChangeDate);
                    return taskProgressRepository.save(existingCategory);
                })
                .orElseGet(() -> {
                    taskprogress.setId(id);
                    return taskProgressRepository.save(taskprogress);
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public void deleteTaskProgress(@PathVariable Integer id) {
        taskProgressRepository.deleteById(id);
    }

}
