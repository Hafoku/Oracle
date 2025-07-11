package org.company.Oracle.controllers;

import org.company.Oracle.models.User;
import org.company.Oracle.models.Role;
import org.company.Oracle.dto.UserDTO;
import org.company.Oracle.exceptions.UserAlreadyExistException;
import org.company.Oracle.repositories.UserRepository;
import org.company.Oracle.repositories.RoleRepository;
import org.company.Oracle.services.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.company.Oracle.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.stereotype.Controller;

import java.util.List;


@RequestMapping("/user")
@RestController
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private IUserService userService;

    @Autowired
    private UserService userService2;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping("/login")
    public String loginPage(Model model){
        return "login";
    }

    @GetMapping("/registration")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new UserDTO());
        return "registration";
    }

    @PostMapping("/registration")
    public ResponseEntity<?> registerUserAccount(
            @RequestBody @Valid UserDTO userDto, BindingResult bindingResult) {
        ModelAndView mav = new ModelAndView("registration");
        if (bindingResult.hasErrors()) {
           logger.error("Ошибка регистрации: " + bindingResult.getAllErrors());
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }

        try {
            User registered = userService.registerNewUserAccount(userDto);  
            return ResponseEntity.ok(registered);

        } catch (UserAlreadyExistException uaeEx) {
            logger.error("Ошибка, пользователь уже существует: " + uaeEx.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ошибка, пользователь уже существует.");
        }
    }

    @GetMapping("/current")
    public ResponseEntity<User> showCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok().body(userService2.findAuthenticatedUser(authentication));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Attempting to fetch all users");
        List<User> users = (List<User>) userRepository.findAll();
        logger.info("Successfully fetched {} users", users.size());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody String roleName) {
        logger.info("Attempting to update role for user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Role newRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));

        user.setRole(newRole);
        userRepository.save(user);
        logger.info("Successfully updated role for user {} to {}", user.getEmail(), newRole.getName());
        return ResponseEntity.ok(user);
    }
}
