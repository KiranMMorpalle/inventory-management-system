package com.inventory.auth.service;

import com.inventory.auth.dto.AuthResponse;
import com.inventory.auth.dto.LoginRequest;
import com.inventory.auth.dto.RegisterRequest;
import com.inventory.auth.entity.ERole;
import com.inventory.auth.entity.Role;
import com.inventory.auth.entity.User;
import com.inventory.auth.repository.RoleRepository;
import com.inventory.auth.repository.UserRepository;
import com.inventory.auth.config.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder encoder,
                       JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);
        log.info("New user registered: {}", request.getUsername());
        return "User registered successfully!";
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(request.getUsername());
        User user = userRepository.findByUsername(request.getUsername()).get();
        String role = user.getRoles().iterator().next().getName().name();
        log.info("User logged in: {}", request.getUsername());
//        return new AuthResponse(jwt, user.getUsername(), user.getEmail(), role);

        return new AuthResponse(
                jwt,
                "Bearer",
                user.getUsername(),
                user.getEmail(),
                role
        );
    }
}