package com.project.eventhub.rest.auth;

import com.project.eventhub.logic.entity.auth.AuthenticationService;
import com.project.eventhub.logic.entity.auth.JwtService;
import com.project.eventhub.logic.entity.auth.SecurityConfiguration;
import com.project.eventhub.logic.entity.email.EmailService;
import com.project.eventhub.logic.entity.rol.Role;
import com.project.eventhub.logic.entity.rol.RoleEnum;
import com.project.eventhub.logic.entity.rol.RoleRepository;
import com.project.eventhub.logic.entity.user.LoginResponse;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.naming.AuthenticationException;
import java.util.Map;
import java.util.Optional;

@RequestMapping("/auth")
@RestController
public class AuthRestController {


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;



    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthRestController(JwtService jwtService, AuthenticationService authenticationService, EmailService emailService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.emailService = emailService;
    }

    @GetMapping("isauthenticated")
    public ResponseEntity<Boolean> isAuthenticated(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) throws AuthenticationException {
        String token = authenticationService.getTokenFromAuthorationHeader(authorization);
        String userName = jwtService.extractUsername(token);
        Optional<User> user = userRepository.findByEmail(userName);

        if (user.isPresent()) {
            return new ResponseEntity<Boolean>(
                    true,
                    HttpStatus.OK
            );
        }
        else {
            return new ResponseEntity<>(Boolean.FALSE, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody User user, HttpSession httpSession) {
        User authenticatedUser = authenticationService.authenticate(user);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());

        Optional<User> foundedUser = userRepository.findByEmail(user.getEmail());


        foundedUser.ifPresent(loginResponse::setAuthUser);

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Optional<Role> optionalRole = roleRepository.findById(user.getRole().getId());

        if (optionalRole.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Role not found");
        }
        user.setRole(optionalRole.get());
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    public Long getCurrentUserId() {
        User user = getAuthenticatedUser();
        return user != null ? user.getId() : null;
    }

    // Method to get the full authenticated user object if needed
    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal(); // Assuming principal is User entity
        }

        return null;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String token = authenticationService.generateResetPasswordToken(userOptional.get());

        // Construir el enlace de restablecimiento de contraseña
        String resetLink = "http://localhost:4200/reset-password?token=" + token;
        String subject = "Password Reset Request";
        String text = "Please click the following link to reset your password: " + resetLink;

        // Enviar el correo con el token
        emailService.sendEmail(email, subject, text);

        return ResponseEntity.ok("Password reset email sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        try {
            String email = authenticationService.validateResetPasswordToken(token);
            authenticationService.resetPassword(email, newPassword);
            return ResponseEntity.ok("Password successfully updated");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}