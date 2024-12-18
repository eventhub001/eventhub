package com.project.eventhub.rest.task;

import com.project.eventhub.logic.entity.auth.AuthenticationService;
import com.project.eventhub.logic.entity.auth.JwtService;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.rol.RoleEnum;
import com.project.eventhub.logic.entity.task.Task;
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
import java.util.Optional;


@RestController
@RequestMapping("/task")
public class TaskRestController {

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Task addTask(@RequestBody Task task) {
        Event event = eventRepository.findById(task.getEvent().getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        task.setEvent(event);
        return taskRepository.save(task);

    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllTask(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) throws AuthenticationException  {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Task> taskPage;

        // Extract token and find user
        String token = authenticationService.getTokenFromAuthorationHeader(authorization);
        String userName = jwtService.extractUsername(token);
        Optional<User> user = userRepository.findByEmail(userName);

        // Check user role
        if (user.isPresent()) {
            if (user.get().getRole().getName() == RoleEnum.SUPER_ADMIN) {
                taskPage = taskRepository.findAll(pageable);
            } else {
                taskPage = taskRepository.findAllByUserId(user.get().getId(), pageable);
            }
        } else {
            throw new AuthenticationException("User not found. Please make sure to validate the token.");
        }

        // Create Meta object and set pagination details
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(taskPage.getTotalPages());
        meta.setTotalElements(taskPage.getTotalElements());
        meta.setPageNumber(taskPage.getNumber() + 1);
        meta.setPageSize(taskPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Task retrieved successfully",
                taskPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }


    @GetMapping("/event/{eventId}/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllTaskbyEvent(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Optional<Event> foundEvent= eventRepository.findById(eventId);
        if(foundEvent.isPresent()) {

        Pageable pageable = PageRequest.of(page-1, size);
        Page<Task> taskPage = taskRepository.getTaskByEvent_EventId(eventId, pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(taskPage.getTotalPages());
        meta.setTotalElements(taskPage.getTotalElements());
        meta.setPageNumber(taskPage.getNumber() + 1);
        meta.setPageSize(taskPage.getSize());

        return new GlobalResponseHandler().handleResponse("Task retrieved successfully",
                taskPage.getContent(), HttpStatus.OK, meta);

        } else {
            return new GlobalResponseHandler().handleResponse("Event Id " + eventId + " not found"  ,
                    HttpStatus.NOT_FOUND, request);
        }
    }

                @GetMapping("/event/tasks/search")
                @PreAuthorize("isAuthenticated()")
                public ResponseEntity<?> getAllTasksByEventName(
                        @RequestParam String eventName,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "10") int size,
                        HttpServletRequest request) {
                    Pageable pageable = PageRequest.of(page - 1, size);
                    Page<Task> taskPage = taskRepository.getTaskByEvent_EventName(eventName, pageable);

                    Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
                    meta.setTotalPages(taskPage.getTotalPages());
                    meta.setTotalElements(taskPage.getTotalElements());
                    meta.setPageNumber(taskPage.getNumber() + 1);
                    meta.setPageSize(taskPage.getSize());

                    return new GlobalResponseHandler().handleResponse("Tasks retrieved successfully",
                            taskPage.getContent(), HttpStatus.OK, meta);
                }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Integer id, @RequestBody Task task) {
        return taskRepository.findById(id)
                .map(existingTask -> {
                    Optional.ofNullable(task.getTaskName()).ifPresent(existingTask::setTaskName);
                    Optional.ofNullable(task.getDescription()).ifPresent(existingTask::setDescription);
                    Optional.ofNullable(task.getPriority()).ifPresent(existingTask::setPriority);
                    Optional.ofNullable(task.getStatus()).ifPresent(existingTask::setStatus);
                    Optional.ofNullable(task.getDueDate()).ifPresent(existingTask::setDueDate);

                    Event event = eventRepository.findById(task.getEvent().getEventId())
                            .orElseThrow(() -> new RuntimeException("Event not found"));
                    existingTask.setEvent(event);
                    return taskRepository.save(existingTask);
                })
                .orElseGet(() -> {
                    Event event = eventRepository.findById(task.getEvent().getEventId())
                            .orElseThrow(() -> new RuntimeException("Event not found"));
                    task.setEvent(event);
                    task.setId(id);
                    return taskRepository.save(task);
                });
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Integer id) {
        taskRepository.deleteById(id);
    }
}
