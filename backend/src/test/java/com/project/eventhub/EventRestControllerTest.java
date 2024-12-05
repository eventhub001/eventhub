package com.project.eventhub;


import com.project.eventhub.logic.entity.auth.AuthenticationService;
import com.project.eventhub.logic.entity.auth.JwtService;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.event.EventRepository;
import com.project.eventhub.logic.entity.eventtype.EventType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.eventhub.logic.entity.eventtype.EventTypeRepository;
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
public class EventRestControllerTest {



    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAllEvents() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/events")
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Events retrieved successfully"));
    }


    @Test
    public void testUpdateEvent() throws Exception {
        EventType eventType = eventTypeRepository.findById(1L).orElseThrow(() -> new RuntimeException("Event type not found"));

        Event event = new Event();
        event.setEventName("Event created from Unit Testing");
        event.setEventDescription("Unit Testing");
        event.setEventType(eventType);
        eventRepository.save(event);

        // Actualizar el Event entity
        event.setEventName("Updated Event from Unit Testing");
        String updatedEventJson = objectMapper.writeValueAsString(event);

        mockMvc.perform(MockMvcRequestBuilders.put("/events/" + event.getEventId())
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedEventJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventName").value("Updated Event from Unit Testing"))
                .andExpect(jsonPath("$.eventType.eventTypeName").value(eventType.getEventTypeName()));
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





