package org.company.Oracle.controllers;

import jakarta.validation.Valid;
import org.company.Oracle.dto.ProductDto;
import org.company.Oracle.models.Product;
import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.ProductRepository;
import org.company.Oracle.repositories.ProfilePictureRepository;
import org.company.Oracle.repositories.UserRepository;
import org.company.Oracle.services.ProductService;
import org.company.Oracle.services.ProfilePictureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
public class    OnlineShopController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProfilePictureService profilePictureService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    private final Logger logger = LoggerFactory.getLogger(OnlineShopController.class);

    @PostMapping("/create_product")
    public ResponseEntity<Product> createProduct(@Valid Product product,
                                                 @RequestPart(value = "file") MultipartFile file) throws IOException {
        if (file != null){
            Product savedProduct = productService.createProduct(product, file);
            return ResponseEntity.ok().body(savedProduct);
        }
        else {
            throw new IllegalArgumentException("Ошибка. Фотография продукта отсутствует");
        }
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> showProduct(@PathVariable("id") Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Продукт не найден"));
        return ResponseEntity.ok().body(product);
    }

    @GetMapping("/product/files/{id}")
    public ResponseEntity<Resource> showProductImages(@PathVariable("id") Long id) throws IOException {
        logger.info("Айди изображения: {}", id);
        ProfilePicture image = profilePictureRepository.findById(id).orElseThrow(() -> new RuntimeException("Фотография продукта не найден"));
        Path path = Paths.get(image.getFilePath().replace("\\", "/"));
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            logger.error("Файл не существует/нечитаемый. Файл: {}", resource);
            throw new RuntimeException("Файл не существует/нечитаемый");
        }
        logger.info("Идёт запрос на получение изображение продукта: {}, c путём:{}", image.getName(), resource);
        return ResponseEntity.ok()
                .contentType((MediaType.parseMediaType(image.getType())))
                .body(resource);
    }

    @GetMapping("/products")
    public ResponseEntity<Iterable<Product>> showProducts(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication.isAuthenticated()){
            Iterable <Product> products = productRepository.findAll();
            return ResponseEntity.ok().body(products);
        }
        else {
            throw new UsernameNotFoundException("Пользователь не был найден.");
        }
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable("id") Long id, @RequestPart ProductDto newProduct, @RequestPart(value = "avatar", required = false) MultipartFile file ) throws IOException {
        Product oldProduct = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Продукт не найден"));
        Product updatedProduct= productService.updateProduct(newProduct, oldProduct, file);
        return ResponseEntity.ok().body(updatedProduct);
    }

    @DeleteMapping("/user/avatar/{id}")
    public ResponseEntity<String> deleteAvatar(@PathVariable("id") Long id) {
        logger.info("Запрос на удаление аватара с ID: {}", id);

        // 1. Получаем изображение из БД
        ProfilePicture avatar = profilePictureRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Аватар с ID {} не найден в базе данных", id);
                    return new RuntimeException("Аватар не найден");
                });

        // 2. Получаем текущего пользователя
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        logger.info("Аутентифицированный пользователь: {}", email);

        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.error("Пользователь с email {} не найден", email);
            throw new UsernameNotFoundException("Пользователь не найден");
        }


        // 3. Проверка принадлежности
        if (user.getAvatar() == null) {
            logger.warn("У пользователя {} нет установленного аватара", email);
            return ResponseEntity.badRequest().body("Аватар не установлен");
        }

        if (!user.getAvatar().getId().equals(id)) {
            logger.warn("Попытка удалить аватар, не принадлежащий пользователю {}. ID аватара: {}, у пользователя: {}",
                    email, id, user.getAvatar().getId());
            return ResponseEntity.status(403).body("Вы не можете удалить этот аватар");
        }

        // 4. Удаление файла и записи
        try {
            Path filePath = Paths.get(avatar.getFilePath().replace("\\", "/"));
            logger.info("Попытка удалить файл по пути: {}", filePath);

            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                logger.info("Файл {} успешно удалён", filePath);
            } else {
                logger.warn("Файл {} не найден при попытке удаления", filePath);
            }

            profilePictureRepository.delete(avatar);
            logger.info("Запись ProfilePicture с ID {} удалена из базы данных", id);

            user.setAvatar(null);
            userRepository.save(user);
            logger.info("У пользователя {} поле avatar обнулено", email);

            return ResponseEntity.ok("Аватар успешно удалён");

        } catch (IOException e) {
            logger.error("Ошибка при удалении файла аватара: {}", e.getMessage());
            return ResponseEntity.status(500).body("Ошибка при удалении аватара");
        }
    }

}
