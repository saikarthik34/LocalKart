
package com.localkart.localkart.user;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.localkart.localkart.security.JwtService;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(
            UserService userService,
            JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    // Customer and Seller Registration
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(
            @RequestBody User user) {

        User savedUser = userService.registerUser(user);

        Map<String, Object> response = Map.of(
                "id", savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "email", savedUser.getEmail(),
                "role", savedUser.getRole(),
                "message", "Registration successful"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // User Login with JWT
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(
            @RequestBody Map<String, String> loginRequest) {

        User user = userService.loginUser(
                loginRequest.get("email"),
                loginRequest.get("password")
        );

        // Generate JWT token
        String token = jwtService.generateToken(user);

        Map<String, Object> response = Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "token", token,
                "message", "Login successful"
        );

        return ResponseEntity.ok(response);
    }
}
