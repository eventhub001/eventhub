package com.project.eventhub;


import com.project.eventhub.logic.entity.auth.AuthenticationService;
import com.project.eventhub.logic.entity.auth.JwtService;
import com.project.eventhub.logic.entity.event.EventRepository;
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

    @Test
    public void testGetAllEvents() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/events")
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Events retrieved successfully"));
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





