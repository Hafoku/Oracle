package org.company.Oracle.services;

import jakarta.transaction.Transactional;
import org.company.Oracle.models.News;
import org.company.Oracle.models.UploadedFiles;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.UploadedFileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class UploadedFileService {

    @Autowired
    private UploadedFileRepository uploadedFileRepository;

    private Integer fileSize;

    private final String FOLDER_PATH = System.getProperty("user.dir") + "/files";

    private static final Logger logger = LoggerFactory.getLogger(UploadedFileService.class);

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "svg",
            "mp4", "mov", "avi", "mkv", "webm", "wmv", "flv",
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "rtf", "odt", "ods", "odp"
    );

    public UploadedFiles uploadFileToDataSystem(MultipartFile file) throws IOException {
        if (!file.isEmpty()) {
            String contentType = file.getContentType();
            validate(file, contentType);
            logger.debug("MIME Type: " + contentType);
            fileSize = Math.toIntExact(file.getSize() / 1024);
            if ( fileSize > 50 * 1024){
                throw new IllegalArgumentException("Ошибка. Файл не должен весить больше 50 мегабайт. Вес файла: " + fileSize / 1024 + " мегабайт");
            }
            String filePath = Paths.get(FOLDER_PATH, UUID.randomUUID() + "_" + file.getOriginalFilename()).toString();
            File folder = new File(FOLDER_PATH);
            if (!folder.exists()) {
                folder.mkdirs();
                logger.info("Создана директория: {}", FOLDER_PATH);
            }
            UploadedFiles uploadedFile = UploadedFiles.builder()
                    .name(file.getOriginalFilename())
                    .type(file.getContentType())
                    .filePath(filePath)
                    .fileSize(fileSize)
                    .build();

            file.transferTo(new File(filePath));
            logger.info("Файл {} весом {} КБ был сохранён в: {}", file.getOriginalFilename(), fileSize, filePath);

            UploadedFiles savedFile = uploadedFileRepository.save(uploadedFile);

            logger.info("Файл {} был сохранён в базу данных", savedFile.getName());

            return savedFile;
        }
        else {
            throw new IllegalArgumentException("Ошибка. Файл пустой");
        }
    }

    public void validate(MultipartFile file, String contentType){
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("Ошибка. Имя файла отсутсвует");
        }
            int dotIndex = filename.lastIndexOf('.');
            if (dotIndex == -1 || dotIndex == filename.length() - 1) {
                throw new IllegalArgumentException("Ошибка. У файла отсутствует расширение");
            }
            String extension = filename.substring(dotIndex + 1).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(extension)){
                throw new IllegalArgumentException("Файлы типа " + extension + " запрещены. Разрешённые расширения: " + ALLOWED_EXTENSIONS);
            }
    }

    public UploadedFiles save(UploadedFiles file) {
        return uploadedFileRepository.save(file);
    }

    public void deleteFile(Long fileId){
        UploadedFiles file = uploadedFileRepository.findById(fileId).orElseThrow(() -> new IllegalArgumentException("Файл не найден"));
        File physicalFile = new File(file.getFilePath());
        if (physicalFile.exists()){
            if (physicalFile.delete()){
                logger.info("Файл был успешно удалён из системы");
            }
            else {
                logger.warn("Не удалось удалить файл {} по пути {}", file.getName(), file.getFilePath());
            }
        }
        else {
            logger.warn("Физический файл {} не был найден, но запись в БД будет удалена", file.getName());
        }
        uploadedFileRepository.delete(file);
    }

}
