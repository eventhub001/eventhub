package com.project.eventhub.rest.rol;

import com.project.eventhub.logic.entity.rol.Role;
import com.project.eventhub.logic.entity.rol.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/roles")
public class RolRestController {
    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("permitAll()")
    public List<Role> getAllRoles() {
        return (List<Role>) roleRepository.findAll();
    }
}