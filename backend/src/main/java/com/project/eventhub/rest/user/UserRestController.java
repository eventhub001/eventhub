package com.project.eventhub.rest.user;

import com.project.eventhub.logic.entity.rol.Role;
import com.project.eventhub.logic.entity.rol.RoleEnum;
import com.project.eventhub.logic.entity.rol.RoleRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserRestController {
    @Autowired
    private UserRepository UserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page, // Número de página, por defecto 0
            @RequestParam(defaultValue = "10") int size, // Tamaño de página, por defecto 10
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page-1, size);
        Page<User> usersPage = UserRepository.findAll(pageable);

        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(usersPage.getTotalPages());
        meta.setTotalElements(usersPage.getTotalElements());
        meta.setPageNumber(usersPage.getNumber());
        meta.setPageSize(usersPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Users retrieved successfully",
                usersPage.getContent(), // El contenido de la página
                HttpStatus.OK,
                meta
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public User addUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Optional<Role> optionalRole = roleRepository.findByName(RoleEnum.Supplier);
        if (optionalRole.isEmpty()) {
            return null;
        }
        user.setRole(optionalRole.get());
        return UserRepository.save(user);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return UserRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return UserRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setName(user.getName());
                    existingUser.setLastname(user.getLastname());
                    existingUser.setEmail(user.getEmail());
                    return UserRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    user.setId(id);
                    return UserRepository.save(user);
                });
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        UserRepository.deleteById(id);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public User authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

}