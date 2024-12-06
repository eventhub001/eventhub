package com.project.eventhub;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.eventhub.logic.entity.VendorCategory.VendorCategory;
import com.project.eventhub.logic.entity.VendorCategory.VendorCategoryRepository;
import com.project.eventhub.logic.entity.VendorService.VendorServiceRepository;
import com.project.eventhub.logic.entity.VendorService.Vendor_service;
import com.project.eventhub.logic.entity.auth.JwtService;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import com.project.eventhub.logic.entity.vendor.Vendor;
import com.project.eventhub.logic.entity.vendor.VendorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Collection;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class VendorRestController {

@Autowired
private MockMvc mockMvc;

@Autowired
private UserRepository userRepository;

@Autowired
private JwtService jwtService;
    @Autowired
    private VendorRepository vendorRepository;
    @Autowired
    private VendorCategoryRepository vendorCategoryRepository;
    @Autowired
    private VendorServiceRepository vendorServiceRepository;


    @Test
    @WithMockUser(roles = "SUPER_ADMIN")
    public void testAddVendor() throws Exception {
        // Buscar el usuario por email
        User user = userRepository.findByEmail("super.admin@gmail.com").orElseThrow(() -> new RuntimeException("User not found"));
        VendorCategory vendorCategory = vendorCategoryRepository.findById(1).orElseThrow(() -> new RuntimeException("Vendor category not found"));
        Vendor_service vendorService = vendorServiceRepository.findById(1).orElseThrow(() -> new RuntimeException("Vendor service not found"));

        // Crear un vendor y asignar el usuario
        Vendor vendor = new Vendor();
        vendor.setName("Test Vendor");
        vendor.setDescription("Test Description");
        vendor.setVendorCategory(vendorCategory);
        vendorService.setVendor(vendor);
        vendor.setUser(user);

        // Configurar ObjectMapper para ignorar el campo authorities
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.addMixIn(User.class, UserMixin.class);
        String vendorJson = objectMapper.writeValueAsString(vendor);

        // Realizar la solicitud POST para agregar el vendor
        mockMvc.perform(MockMvcRequestBuilders.post("/vendor")
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vendorJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Vendor"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    // Clase Mixin para ignorar el campo authorities
    abstract class UserMixin {
        @JsonIgnore
        abstract Collection<? extends GrantedAuthority> getAuthorities();
    }

    @Test
    public void testGetAllVendors() throws Exception {
        // Perform GET request to retrieve all vendors
        mockMvc.perform(MockMvcRequestBuilders.get("/vendor")
                        .header("Authorization", "Bearer " + getToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Vendors retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray());
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
