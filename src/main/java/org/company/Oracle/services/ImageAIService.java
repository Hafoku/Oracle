package org.company.Oracle.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageAIService {

    private final WebClient webClient;

    @Value("${ai.gemini.api}")
    private String apiKey;

    public byte[] generateImage(String prompt) {
        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "response_mime_type", "image/png"
                )
        );

        Map<String, Object> response = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/models/gemini-2.0-flash-exp-image-generation:generateContent")
                        .queryParam("key", apiKey)
                        .build())
                .bodyValue(payload)
                .retrieve()
                .onStatus(HttpStatusCode::isError, clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    log.error("🖼️ Ошибка генерации изображения Gemini: {}", errorBody);
                                    return Mono.error(new RuntimeException("Gemini image gen error: " + errorBody));
                                })
                )
                .bodyToMono(Map.class)
                .block();

        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                for (Map<String, Object> part : parts) {
                    Map<String, Object> inlineData = (Map<String, Object>) part.get("inlineData");
                    if (inlineData != null) {
                        String base64 = (String) inlineData.get("data");
                        return Base64.getDecoder().decode(base64);
                    }
                }
            }
        } catch (Exception e) {
            log.error("❌ Ошибка парсинга изображения Gemini", e);
        }

        return null;
    }

    public String saveImage(byte[] imageBytes, String fileName) {
        try {
            Path path = Paths.get("uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, imageBytes);
            return "/uploads/" + fileName;
        } catch (Exception e) {
            log.error("❌ Не удалось сохранить изображение", e);
            return null;
        }
    }
}
