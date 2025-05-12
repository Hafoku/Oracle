package org.company.Oracle.controllers;

import org.company.Oracle.models.User;
import org.company.Oracle.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/user")
@RestController
public class LoginController {

    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user){
        String token = userService.verify(user);
        logger.info("Попытка входа в аккаунт");
        if (token != null){
            logger.info("Пользователь {} вошёл в аккаунт", user.getEmail());
            return ResponseEntity.ok().body(token);
        }
        else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}
