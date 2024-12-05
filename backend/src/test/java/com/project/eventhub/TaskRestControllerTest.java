package com.project.eventhub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.eventhub.logic.entity.auth.AuthenticationService;
import com.project.eventhub.logic.entity.auth.JwtService;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.eventtype.EventType;
import com.project.eventhub.logic.entity.eventtype.EventTypeRepository;
import com.project.eventhub.logic.entity.task.Task;
import com.project.eventhub.logic.entity.task.TaskRepository;
import com.project.eventhub.logic.entity.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TaskRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventTypeRepository eventTypeRepository;



    @Test
    public void testAddTask() throws Exception {
        EventType eventType = eventTypeRepository.findById(1L).orElseThrow(() -> new RuntimeException("Event type not found"));

        Event event = new Event();
        event.setEventType(eventType);
        event.setEventName("New Event");
        event.setEventDescription("New Event Description");
        event = eventRepository.save(event);

        Task task = new Task();
        task.setTaskName("New Task");
        task.setDescription("New Task Description");
        task.setPriority("Alta");
        task.setStatus("Pendiente");
        task.setEvent(event);

        String taskJson = objectMapper.writeValueAsString(task);

        mockMvc.perform(MockMvcRequestBuilders.post("/task")
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskName").value("New Task"));
    }

    @Test
    public void testGetAllTask() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/task")
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Task retrieved successfully"));
    }

    @Test
    public void testGetAllTaskbyEvent() throws Exception {
        Event event = new Event();
        event.setEventType(eventTypeRepository.findById(1L).orElseThrow(() -> new RuntimeException("Event type not found")));
        eventRepository.save(event);

        mockMvc.perform(MockMvcRequestBuilders.get("/task/event/427/tasks")
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Task retrieved successfully"));
    }

    @Test
    public void testUpdateTask() throws Exception {
        Event event = new Event();
        event.setEventType(eventTypeRepository.findById(1L).orElseThrow(() -> new RuntimeException("Event type not found")));
        eventRepository.save(event);

        Task task = new Task();
        task.setTaskName("Task to Update");
        task.setEvent(event);
        taskRepository.save(task);

        task.setTaskName("Updated Task");
        String updatedTaskJson = objectMapper.writeValueAsString(task);

        mockMvc.perform(MockMvcRequestBuilders.put("/task/" + task.getId())
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedTaskJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskName").value("Updated Task"));
    }

    @Test
    public void testDeleteTask() throws Exception {
        Task task = new Task();
        task.setEvent(eventRepository.findById(1L).orElseThrow(() -> new RuntimeException("Event not found")));
        task.setTaskName("Task to Delete");
        taskRepository.save(task);

        mockMvc.perform(MockMvcRequestBuilders.delete("/task/" + task.getId())
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    private String getToken() {
        UserDetails userDetails = userRepository.findByEmail("super.admin@gmail.com").orElseThrow(() -> {
            System.out.println("User not found");
            return new RuntimeException("User not found");
        });
        String token = jwtService.generateToken(userDetails);
        System.out.println("Generated Token: " + token);
        return token;
    }
}