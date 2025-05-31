package org.company.Oracle.services;

import jakarta.transaction.Transactional;
import org.company.Oracle.models.News;
import org.company.Oracle.models.Product;
import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.NewsRepository;
import org.company.Oracle.repositories.ProductRepository;
import org.company.Oracle.repositories.ProfilePictureRepository;
import org.company.Oracle.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProfilePictureService {

    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private ProductRepository productRepository;

    private final String USER_PATH = System.getProperty("user.dir") + "/uploads";
    private final String NEWS_PATH = System.getProperty("user.dir") + "/news";
    private final String PRODUCT_PATH = System.getProperty("user.dir") + "/product";

    private static final Logger logger = LoggerFactory.getLogger(ProfilePictureService.class);

    @Transactional
    public ProfilePicture uploadFileToDataSystem(MultipartFile file, Long entityId, String entityType) throws IOException {
        User user = getCurrentUser();
        validate(file, entityType, user);

        return switch (entityType) {
            case "User" -> saveUserAvatar(file, user);
            case "News" -> saveNewsAvatar(file, entityId, user);
            case "List" -> saveListImage(file);
            case "Product" -> saveProductAvatar(file, entityId, user);
            default -> throw new IllegalArgumentException("Тип " + entityType + " не поддерживается");
        };
    }

    private ProfilePicture saveUserAvatar(MultipartFile file, User user) throws IOException {
        removeOldUserAvatar(user);
        ProfilePicture newPic = saveFile(file, Paths.get(USER_PATH, user.getId().toString()).toString());
        user.setAvatar(newPic);
        userRepository.save(user);
        return newPic;
    }

    private ProfilePicture saveNewsAvatar(MultipartFile file, Long newsId, User user) throws IOException {
        News news = newsRepository.findById(newsId).orElseThrow(() -> new RuntimeException("Новость не найдена"));
        ProfilePicture newPic = saveFile(file, Paths.get(NEWS_PATH, news.getId().toString()).toString());
        news.setAvatar(newPic);
        news.setAuthor(user);
        newsRepository.save(news);
        return newPic;
    }

    private ProfilePicture saveListImage(MultipartFile file) throws IOException {
        return saveFile(file, NEWS_PATH);
    }

    private ProfilePicture saveProductAvatar(MultipartFile file, Long productId, User user) throws IOException {
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Продукт не найден"));
        if (product.getAvatar() != null) {
            deletePhysicalAndDb(product.getAvatar());
            product.setAvatar(null);
        }
        ProfilePicture newPic = saveFile(file, Paths.get(PRODUCT_PATH, product.getId().toString()).toString());
        product.setAvatar(newPic);
        productRepository.save(product);
        return newPic;
    }

    private ProfilePicture saveFile(MultipartFile file, String folderPath) throws IOException {
        File dir = new File(folderPath);
        if (!dir.exists()) dir.mkdirs();

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String fullPath = Paths.get(folderPath, fileName).toString();
        file.transferTo(new File(fullPath));

        ProfilePicture pic = ProfilePicture.builder()
                .name(file.getOriginalFilename())
                .type(file.getContentType())
                .filePath(fullPath)
                .fileSize((int) (file.getSize() / 1024))
                .build();

        return profilePictureRepository.save(pic);
    }

    private void removeOldUserAvatar(User user) {
        ProfilePicture old = profilePictureRepository.findByUser(user);
        if (old != null) {
            deletePhysicalAndDb(old);
            user.setAvatar(null);
            userRepository.save(user);
        }
    }

    private void deletePhysicalAndDb(ProfilePicture pic) {
        File file = new File(pic.getFilePath());
        if (file.exists()) file.delete();
        profilePictureRepository.delete(pic);
    }

    private void validate(MultipartFile file, String entityType, User user) {
        if (!entityType.equals("List") && user == null)
            throw new UsernameNotFoundException("Пользователь не найден");

        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("Файл отсутствует или пуст");

        String type = file.getContentType();
        if (type == null || !type.startsWith("image"))
            throw new IllegalArgumentException("Разрешены только изображения");

        int sizeKB = (int) (file.getSize() / 1024);
        if (sizeKB > 20048)
            throw new IllegalArgumentException("Максимальный размер — 2MB. Сейчас: " + sizeKB + "KB");
    }

    public void deleteFile(Long fileId) {
        ProfilePicture file = profilePictureRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Файл не найден"));
        File f = new File(file.getFilePath());
        if (f.exists()) f.delete();
        profilePictureRepository.delete(file);
    }

    @Transactional
    public List<ProfilePicture> uploadListOfFiles(List<MultipartFile> images, News news) {
        List<ProfilePicture> result = new ArrayList<>();
        for (MultipartFile image : images) {
            try {
                ProfilePicture pic = uploadFileToDataSystem(image, null, "List");
                pic.setNews(news);
                result.add(pic);
            } catch (Exception e) {
                logger.error("Ошибка загрузки изображения: {}", e.getMessage());
            }
        }
        return result;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email);
    }
}
