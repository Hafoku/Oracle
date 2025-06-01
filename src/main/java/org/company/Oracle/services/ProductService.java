package org.company.Oracle.services;

import jakarta.transaction.Transactional;
import org.company.Oracle.dto.ProductDto;
import org.company.Oracle.models.Product;
import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.CartItemRepository;
import org.company.Oracle.repositories.ProductRepository;
import org.company.Oracle.repositories.ProfilePictureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.UserPrincipalNotFoundException;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProfilePictureService profilePictureService;

    @Autowired
    private UserService userService;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProfilePictureRepository profilePictureRepository;


    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Transactional
    public Product createProduct(Product product, MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication.isAuthenticated()){
            User user = userService.findAuthenticatedUser(authentication);
            product.setCreator(user);
            Product savedProduct = productRepository.save(product);
            profilePictureService.uploadFileToDataSystem(file, savedProduct.getId(), "Product");
            logger.info("Продукт успешно добавлен в базу данных");
            return savedProduct;
        }
        else {
            throw new RuntimeException("Пользователь не вошёл в аккаунт");
        }
    }

    @Transactional
    public Product updateProduct(ProductDto newProduct, Product oldProduct, MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication.isAuthenticated() && userService.findAuthenticatedUser(authentication).getRole().getName().equals("ADMIN")){
            logger.info("Идёт изменение продукта. Новые данные: Название:{} Описание:{} Тип:{} Цена:{}", newProduct.getName(), newProduct.getDescription(), newProduct.getType(), newProduct.getPrice());
            oldProduct.setName(newProduct.getName());
            oldProduct.setDescription(newProduct.getDescription());
            oldProduct.setType(newProduct.getType());
            oldProduct.setPrice(newProduct.getPrice());
            if (file != null && !file.isEmpty()){
                logger.info("Обновление фотографии продукта: {}", file.getOriginalFilename());
                if (oldProduct.getAvatar() != null){
                    profilePictureService.deleteFile(oldProduct.getAvatar().getId());
                    logger.info("Старая аватарка продукта {} была удалена", oldProduct.getName());
                }
                ProfilePicture newAvatar = profilePictureService.uploadFileToDataSystem(file, oldProduct.getId(),"Product");
                oldProduct.setAvatar(newAvatar);
            }
            logger.info("Продукт {} успешно обновлён", oldProduct.getName());
        }
        else {
            throw new AccessDeniedException("У вас нет прав на изменение продукта");
        }
        return productRepository.save(oldProduct);
    }

    public Product save(Product product) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            User user = userService.findAuthenticatedUser(authentication);
            product.setCreator(user);
        }
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Product product) {
        // Удаляем связанные CartItem
        cartItemRepository.deleteByProduct(product);

        // Удаляем изображение
        if (product.getAvatar() != null) {
            ProfilePicture avatar = product.getAvatar();
            try {
                Path path = Paths.get(avatar.getFilePath().replace("\\", "/"));
                Files.deleteIfExists(path);
                profilePictureRepository.delete(avatar);
            } catch (IOException e) {
                logger.error("Ошибка при удалении изображения: {}", e.getMessage());
            }
        }

        // Удаляем сам продукт
        productRepository.delete(product);
    }

    @Autowired
    private ImageAIService imageAIService;

    @Transactional
    public Product createProductWithImage(String name, String description, int price, String type) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Пользователь не аутентифицирован");
        }

        User user = userService.findAuthenticatedUser(authentication);

        // Генерация изображения по описанию
        byte[] imageBytes = imageAIService.generateImage(description);
        if (imageBytes == null) {
            throw new RuntimeException("Ошибка при генерации изображения");
        }

        // Генерация уникального имени файла
        String fileName = UUID.randomUUID() + ".png";
        String filePath = imageAIService.saveImage(imageBytes, fileName);
        if (filePath == null) {
            throw new RuntimeException("Не удалось сохранить изображение");
        }

        // Сохраняем изображение в БД
        ProfilePicture picture = new ProfilePicture();
        picture.setName(fileName);
        picture.setType("image/png");
        picture.setFilePath("uploads/" + fileName); // путь на сервере
        profilePictureRepository.save(picture);

        // Создаем продукт и связываем его с пользователем и изображением
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setType(type);
        product.setPrice(price);
        product.setAvatar(picture);
        product.setCreator(user);

        return productRepository.save(product);
    }
}
