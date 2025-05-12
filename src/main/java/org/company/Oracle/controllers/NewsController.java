package org.company.Oracle.controllers;

import org.company.Oracle.dto.NewsDto;
import org.company.Oracle.models.News;
import org.company.Oracle.models.ProfilePicture;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.NewsRepository;
import org.company.Oracle.repositories.ProfilePictureRepository;
import org.company.Oracle.repositories.UserRepository;
import org.company.Oracle.services.NewsService;
import org.company.Oracle.services.ProfilePictureService;
import org.company.Oracle.services.UploadedFileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
public class NewsController {

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private ProfilePictureService profilePictureService;

    @Autowired
    private UploadedFileService uploadedFilesService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfilePictureRepository profilePictureRepository;

    @Autowired
    private NewsService newsService;

    private static final Logger logger = LoggerFactory.getLogger(NewsController.class);

    @PostMapping("/news")
    public ResponseEntity<Optional<News>> createNews(StandardMultipartHttpServletRequest request) throws IOException {
        MultipartFile file = request.getFile("file");
        List<MultipartFile> images = request.getFiles("images");
        String title = request.getParameter("title");
        String description = request.getParameter("description");
        String content = request.getParameter("content");
        News news = newsService.createNews(title, description, content, file, images);
        return ResponseEntity.ok().body(Optional.of(news));
    }

    @GetMapping("/api/news/{id}")
    public ResponseEntity<News> showNews(@PathVariable("id") Long id) throws IOException {
        News news = newsRepository.findById(id).orElseThrow(() -> new RuntimeException("Новость не найдена"));
        logger.info("Размер списк изображений новости: {}", news.getImages().size());
        return ResponseEntity.ok().body(news);
    }

    @DeleteMapping("/api/news/{id}")
    public void deleteNews(@PathVariable("id") Long id){
        News news = newsRepository.findById(id).orElseThrow(() -> new RuntimeException("Новость не найдена"));
        newsRepository.delete(news);
    }

    @GetMapping("api/files/{id}")
    public ResponseEntity<Resource> showNewsImages(@PathVariable("id") Long id) throws IOException {
        ProfilePicture image = profilePictureRepository.findById(id).orElseThrow(() -> new RuntimeException("Новость не найдена"));
        Path path = Paths.get(image.getFilePath().replace("\\", "/"));
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            logger.error("Файл не существует/нечитаемый. Файл: {}", resource);
            throw new RuntimeException("Файл не существует/нечитаемый");
        }
        return ResponseEntity.ok()
                .contentType((MediaType.parseMediaType(image.getType())))
                .body(resource);
    }

    @GetMapping("/api/news")
    public ResponseEntity<List<News>> getAllNews() {
        Iterable<News> newsIterable = newsRepository.findAll();
        List<News> newsList = new ArrayList<>();
        newsIterable.forEach(newsList::add);
        return ResponseEntity.ok().body(newsList);
    }

    @DeleteMapping("/api/news/{newsId}/images/{imageId}")
    public ResponseEntity<?> deleteImageFromListNews(@PathVariable("newsId") Long newsId, @PathVariable("imageId") Long imageId) {
        ProfilePicture image = profilePictureRepository.findById(imageId).orElseThrow(() -> new RuntimeException("Файл не найден"));
        News news = newsRepository.findById(newsId).orElseThrow(() -> new RuntimeException("Новость не найдена"));
        news.getImages().remove(image);
        newsRepository.save(news);
        profilePictureRepository.delete(image);
        profilePictureRepository.flush();
        File file = new File(image.getFilePath());
        if (file.exists()){
            if (file.delete()){
                logger.info("Файл успешно удалён из системы");
            }
            else {
                logger.error("Не удалось удалить файл {}", image.getFilePath());
            }
        }
        logger.info("Фотография {} удалена", image.getName());
        return ResponseEntity.ok("Фотография удалена.");
    }

    @PutMapping("/api/news/{id}")
    public ResponseEntity<?> updateNews(@PathVariable("id") Long id, @RequestPart NewsDto newNews, @RequestPart(value = "avatar", required = false) MultipartFile avatar, @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        logger.info("Получен JSON для обновления новости: {}", newNews);
        News news = newsRepository.findById(id).orElseThrow(() -> new RuntimeException("Новость не найдена"));
        News updatedNews = newsService.updateNews(news, newNews, images, avatar);
        return ResponseEntity.ok().body(updatedNews);
    }
}
