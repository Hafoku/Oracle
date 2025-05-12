package org.company.Oracle.controllers;

import org.company.Oracle.models.UploadedFiles;
import org.company.Oracle.repositories.UploadedFileRepository;
import org.company.Oracle.services.UploadedFileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/uploads")
public class UploadedFileController {


    private final UploadedFileService fileService;
    private final UploadedFileRepository fileRepository;
    private static final Logger logger = LoggerFactory.getLogger(UploadedFileService.class);

    public UploadedFileController(UploadedFileService fileService, UploadedFileRepository fileRepository) {
        this.fileService = fileService;
        this.fileRepository = fileRepository;
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Optional<UploadedFiles>> getFile(@PathVariable String filename) throws IOException{
        Optional<UploadedFiles> file = fileRepository.findByName(filename);
        return ResponseEntity.ok().body(file);
    }

    @PostMapping("/file")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException{
        if (file == null || file.isEmpty()){
            logger.error("Ошибка. Не удалось загрузить файл");
            return ResponseEntity.badRequest().body("Ошибка. Не удалось загрузить файл");
        }
        try{
            fileService.uploadFileToDataSystem(file);
            return ResponseEntity.ok("Файл успешно загружен");
        }
        catch (IOException e){
            logger.error("Файл не был загружен. Ошибка: " + e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка сервера при загрузке файла");
        }
    }

    @DeleteMapping("/file/delete")
    public ResponseEntity<String> deleteFile(@RequestParam("id") Long fileId) throws IOException{
        fileService.deleteFile(fileId);
        return ResponseEntity.ok().body("Файл был успешно удалён");
    }

}
