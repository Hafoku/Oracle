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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProfilePictureService {

    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private final String FOLDER_PATH = System.getProperty("user.dir") + "/uploads";
    private final String NEWS_FOLDER_PATH = System.getProperty("user.dir") + "/news";
    private final String PRODUCT_FOLDER_PATH = System.getProperty("user.dir") + "/product";

    private static final Logger logger = LoggerFactory.getLogger(ProfilePictureService.class);

    private Integer fileSize;

    @Transactional
    public ProfilePicture uploadFileToDataSystem(MultipartFile file, Long entityId, String entityType) throws IOException{
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName());
        logger.info("Найден пользователь {}", authentication.getName());
        validate(file, entityType, user);
        return switch (entityType) {
            case "User" -> handleUserAvatar(file, user);
            case "News" -> handleNewsAvatar(file, entityId, user);
            case "List" -> handleListAvatars(file);
            case "Product" -> handleProductAvatar(file, entityId, user);
            default ->
                    throw new IllegalArgumentException("Введён неправильный тип аватарки при запросе к сервису. Введённый тип: " + entityType + " допустимые типы: " + News.class.getSimpleName() + ", " + User.class.getSimpleName() + ", List");
        };
    }

    private ProfilePicture handleProductAvatar(MultipartFile file, Long productId, User user) throws IOException {
        isExist(user);
        logger.info("Сохранения изображения для продукта");
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Продукт не найден. Айди:" + productId));
        ProfilePicture savedFile = createFolder(file, Paths.get(PRODUCT_FOLDER_PATH, product.getId().toString()).toString());
        logger.info("Файл {} был сохранён в базу данных", savedFile.getName());
        return savedFile;
    }

    private ProfilePicture handleListAvatars(MultipartFile file) throws IOException {
        logger.info("Сохранение списка изображений для новостей");
        ProfilePicture savedFile = createFolder(file, Paths.get(NEWS_FOLDER_PATH, file.getOriginalFilename().toString()).toString());
        logger.info("Файл {} был сохранён в базу данных", savedFile.getName());
        return savedFile;
    }

    private ProfilePicture handleNewsAvatar(MultipartFile file, Long entityId, User user) throws IOException {
        isExist(user);
        logger.info("Сохранение изображения для новости.");
        News news = newsRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Новость не найдена"));
        ProfilePicture savedFile = createFolder(file, Paths.get(NEWS_FOLDER_PATH, news.getId().toString()).toString());
        news.setAvatar(savedFile);
        news.setAuthor(user);
        newsRepository.save(news);
        logger.info("Файл был сохранён в базу данных с айди: {}. Для новости: {}. Файл:{}, Владелец: {}", savedFile.getId(), news.getTitle(), news.getAvatar().getName(), news.getAuthor().getName());
        return savedFile;
    }

    private ProfilePicture handleUserAvatar(MultipartFile file, User user) throws IOException {
        isExist(user);
        ProfilePicture savedFile = createFolder(file, Paths.get(FOLDER_PATH, user.getId().toString()).toString());
        user.setAvatar(savedFile);
        userRepository.save(user);
        logger.info("Файл был сохранён в базу данных с айди: {}. Для пользователя: {}. Файл:{}", savedFile.getId(), user.getName(), user.getAvatar().getName());
        return savedFile;
    }

    private ProfilePicture createFolder(MultipartFile file, String FolderPath) throws IOException {
        File Folder = new File(FolderPath);
        if (!Folder.exists()) {
            Folder.mkdirs();
            logger.info("Создана директория: {}", FOLDER_PATH);
        }
        String filePath = Paths.get(FolderPath, UUID.randomUUID() + "_" + file.getOriginalFilename()).toString();
        try{
            file.transferTo(new File(filePath));
        }catch (Exception e){
            logger.error("Файл {} не найден на пути: {}, ошибка: {}", file.getOriginalFilename(), filePath, e.getMessage());
            throw new IOException("Файл не был найден");
        }
        logger.info("Файл {} был сохранён в: {}", file.getOriginalFilename(), filePath);
        return createProfilePicture(file, filePath);
    }


    private ProfilePicture createProfilePicture(MultipartFile file, String filePath){
        ProfilePicture profilePicture = ProfilePicture.builder()
                .name(file.getOriginalFilename())
                .type(file.getContentType())
                .filePath(filePath)
                .fileSize(fileSize)
                .build();

        return profilePictureRepository.save(profilePicture);
    }

    private void isExist(User user){
        ProfilePicture existingFile = profilePictureRepository.findByUser(user);
        if(existingFile != null){
            File oldFile = new File(existingFile.getFilePath());
            if(oldFile.exists()){
                if (oldFile.delete()){
                    user.setAvatar(null);
                    profilePictureRepository.delete(existingFile);
                    logger.info("Старая фотография профиля была удалена");
                }
                else {
                    logger.error("Ошибка. Не вышло удалить старую фотографию профиля");
                    throw new IllegalStateException("Не удалось удалить старый файл");
                }
            }
            userRepository.save(user);
        }
    }

    private void validate(MultipartFile file, String entityType, User user){
        if (!entityType.equals("List") && user == null) {
            throw new UsernameNotFoundException("Пользователь не найден");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл отсутствует или пуст");
        }
        String contentType = file.getContentType();
        logger.debug("MIME Type: " + contentType);
        fileSize = Math.toIntExact(file.getSize() / 1024);
        if ( fileSize > 2 * 1024){
            throw new IllegalArgumentException("Ошибка. Файл не должен весить больше 2 мегабайт. Вес файла: " + fileSize / 1024 + " мегабайт");
        }
        if (contentType != null && !contentType.startsWith("image")) {
            throw new IllegalArgumentException("Ошибка. Доступны только изображения");
        }
    }

    public void deleteFile(Long fileId){
        ProfilePicture file = profilePictureRepository.findById(fileId).orElseThrow(() -> new IllegalArgumentException("Файл не найден"));
        File physicalFile = new File(file.getFilePath());
        if (physicalFile.exists()){
            if (physicalFile.delete()){
                logger.info("Файл был успешно удалён из системы");
            }
            else {
                logger.error("Не удалось удалить файл {} по пути {}", file.getName(), file.getFilePath());
                throw new IllegalStateException("Не удалось удалить файл");
            }
        }
        else {
            logger.warn("Физический файл {} не был найден, но запись в БД будет удалена", file.getName());
        }
        profilePictureRepository.delete(file);
    }

    @Transactional
    public List<ProfilePicture> uploadListOfFiles(List<MultipartFile> images, News news) {
        try{
            List<ProfilePicture> newsImages = new ArrayList<>();
            for (MultipartFile image: images){
                logger.info("Загружается файл {}", image);
                ProfilePicture pictures = uploadFileToDataSystem(image, null , "List");
                pictures.setNews(news);
                newsImages.add(pictures);
            }
            return newsImages;
        }
        catch (Exception e){
            logger.error("Ошибка при загрузке файлов: ", e);
            throw new RuntimeException("Ошибка. Файлы не найдены. " + e.getMessage());
        }
    }
}
