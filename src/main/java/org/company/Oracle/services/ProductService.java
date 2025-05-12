package org.company.Oracle.services;

import jakarta.transaction.Transactional;
import org.company.Oracle.dto.ProductDto;
import org.company.Oracle.models.Product;
import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.ProductRepository;
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
import java.nio.file.attribute.UserPrincipalNotFoundException;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProfilePictureService profilePictureService;

    @Autowired
    private UserService userService;

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
}
