package org.company.Oracle.services;

import jakarta.transaction.Transactional;
import org.company.Oracle.dto.NewsDto;
import org.company.Oracle.models.News;
import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.NewsRepository;
import org.company.Oracle.repositories.ProfilePictureRepository;
import org.company.Oracle.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NewsService {

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    @Autowired
    private ProfilePictureService profilePictureService;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(NewsService.class);

    @Transactional
    public News createNews(String title, String description, String content, MultipartFile file, List<MultipartFile> images) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName());
        if (!newsRepository.findRecentNewsByUser(user.getEmail(), LocalDateTime.now().minusMinutes(5)).isEmpty()){
            throw new IOException("Вы уже создали новость, подождите 5 минут чтобы создать ещё одну");
        }
        News news = new News();
        news.setTitle(title);
        news.setDescription(description);
        news.setContent(content);
        news.setAuthor(user);
        News savedNews = newsRepository.save(news);
        profilePictureService.uploadFileToDataSystem(file, savedNews.getId(), "News");
        List<ProfilePicture> imagesList = profilePictureService.uploadListOfFiles(images, savedNews);
        news.getImages().clear();
        news.getImages().addAll(imagesList);
        return savedNews;
    }

    public News updateNews(News news, NewsDto newNews, List<MultipartFile> newImages, MultipartFile avatarFile) throws IOException {

        news.setTitle(newNews.getTitle());
        List<ProfilePicture> images = newNews.getImages().stream().map(imageId -> profilePictureRepository.findById(imageId).orElseThrow(() -> new RuntimeException("Фотография новости не найдена айди: " + imageId))).toList();
        if (newImages != null && !newImages.isEmpty()){
            logger.info("Найдены новые изображения. Сохранение");
            List<ProfilePicture> newImagesList = profilePictureService.uploadListOfFiles(newImages, news);
            news.getImages().clear();
            news.getImages().addAll(newImagesList);
        }
        else{
            logger.warn("Новые изображения не были найдены");
        }
        if (avatarFile != null && !avatarFile.isEmpty()){
            if (news.getAvatar() != null){
                File file = new File(news.getAvatar().getFilePath());
                if (file.exists()){
                    if (file.delete()){
                        logger.info("Старая аватарка новости успешно удалена из системы");
                    }
                    else {
                        logger.error("Не удалось удалить файл {}", news.getAvatar().getFilePath());
                    }
                }
            }
            logger.info("Аватарка: имя = {}, размер = {}", avatarFile.getOriginalFilename(), avatarFile.getSize());
            ProfilePicture newAvatar = profilePictureService.uploadFileToDataSystem(avatarFile, news.getId(), "News");
            news.setAvatar(newAvatar);
        }
        else {
            logger.warn("Новая аватарка отсутствует");
        }
        news.setDescription(newNews.getDescription());
        news.setContent(newNews.getContent());
        News savedNews = newsRepository.save(news);
        logger.info("Новость {} успешно обновлена", news.getTitle());
        return savedNews;
    }
}
