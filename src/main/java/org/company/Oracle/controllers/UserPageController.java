package org.company.Oracle.controllers;

import org.company.Oracle.models.User;
import org.company.Oracle.repositories.ProfilePictureRepository;
import org.company.Oracle.services.ProfilePictureService;
import org.company.Oracle.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
public class UserPageController {

    private static final Logger logger = LoggerFactory.getLogger(UserPageController.class);
    private final UserService userService;
    private final ProfilePictureService profilePictureService;
    private final ProfilePictureRepository profilePictureRepository;

    public UserPageController(UserService userService, ProfilePictureService profilePictureService, ProfilePictureRepository profilePictureRepository) {
        this.userService = userService;
        this.profilePictureService = profilePictureService;
        this.profilePictureRepository = profilePictureRepository;
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findAuthenticatedUser(authentication);

        logger.info("Получены данные пользователя: Имя: {}, Почта: {}, Роль: {}",
                user.getName(), user.getEmail(), user.getRole().getName());

        Map<String, Object> response = new HashMap<>();
        response.put("userName", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().getName());

        if (user.getAvatar() != null) {
            String fullPath = user.getAvatar().getFilePath();
            String relativePath = fullPath.substring(fullPath.indexOf("uploads")).replace("\\", "/");
            response.put("avatar", "http://localhost:8082/" + relativePath);
            logger.info("Путь аватарки: {} новый путь: {}", fullPath, relativePath);
        }
        return ResponseEntity.ok(response);
    }


    // ОБЯЗАТЕЛЬНО ПРОВЕРИТЬ ЗАГРУЗКУ АВАТАРОК
    @PostMapping("/user/changeAvatar")
    public ResponseEntity<String> setAvatar(@RequestParam("image") MultipartFile image) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findAuthenticatedUser(authentication);

        logger.info("Файл {} получен", image.getOriginalFilename());
        profilePictureService.uploadFileToDataSystem(image, user.getId(), "User");

        return ResponseEntity.ok("Аватар успешно изменён");
    }

    @PostMapping("/user/updatePassword")
    public ResponseEntity<Map<String, String>> updatePassword(
            @RequestBody Map<String, String> requestData) {
        String password = requestData.get("password");
        String oldpassword = requestData.get("oldpassword");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findAuthenticatedUser(authentication);
        Map<String, String> response = new HashMap<>();

        if (!userService.checkIfValidOldPassword(user, oldpassword)) {
            response.put("error", "Старый пароль был введён неверно");
            logger.error("Был введён неверный пароль");
            return ResponseEntity.badRequest().body(response);
        }

        userService.updatePassword(user, password);
        response.put("success", "Пароль успешно изменён");
        logger.info("Пароль был успешно изменён");
        return ResponseEntity.ok(response);
    }
}
