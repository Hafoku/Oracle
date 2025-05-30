package org.company.Oracle.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.company.Oracle.dto.ProductGenerateRequest;
import org.company.Oracle.dto.ProductGenerateResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ProductAIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final List<String> types = List.of("first-aid", "equipment", "medicine", "prescription", "otc", "supplements");

    @Value("${ai.gemini.api}")
    private String apiKey;

    public ProductAIService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://generativelanguage.googleapis.com").build();
    }

    public ProductGenerateResponse generateProduct(ProductGenerateRequest request) {
        String prompt = buildPrompt(request.getName(), request.getContext(), request.getLanguage());
        log.info("📤 Сформированный prompt для Gemini: \n{}", prompt);

        // 👇 Исправленный payload
        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        try {
            log.info("📦 Payload, отправляемый в Gemini: {}", objectMapper.writeValueAsString(payload));

            Map<String, Object> response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/models/gemini-1.5-flash:generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse -> clientResponse.bodyToMono(String.class)
                            .flatMap(errorBody -> {
                                log.error("🌐 Gemini API Error: {}", errorBody);
                                return Mono.error(new RuntimeException("Ошибка Gemini: " + errorBody));
                            }))
                    .bodyToMono(Map.class)
                    .block();

            log.info("✅ Получен ответ от Gemini: {}", objectMapper.writeValueAsString(response));

            String text = extractTextFromGemini(response);
            log.info("📜 Извлечённый текст из Gemini: {}", text);

            ProductGenerateResponse product = parseGeminiResponse(text);
            log.info("🎯 Сконвертированный продукт из ответа: {}", product);

            return product;
        } catch (Exception e) {
            log.error("❌ Ошибка при работе с Gemini API", e);
            throw new RuntimeException("Ошибка генерации продукта с помощью Gemini", e);
        }
    }

    private String buildPrompt(String name, String context, String language) {
        String effectiveLanguage = (language != null && !language.isBlank()) ? language : "ru";

        return String.format(
                "Ты помощник для медицинского интернет-магазина. Strictly respond with raw JSON only, no markdown code fences or backticks. На основе названия продукта \"%s\" сгенерируй:\n" +
                        "1. Краткое описание на %s\n" +
                        "2. Реалистичную цену (в тг)\n" +
                        "3. Категорию (одну из: %s)\n" +
                        "4. оставь пустым\n\n" +
                        "Формат вывода строго JSON: { \"description\": ..., \"price\": ..., \"type\": ..., \"imageUrl\": ... }\n\n" +
                        "Контекст: %s",
                name,
                effectiveLanguage,
                String.join(", ", types),
                context != null ? context : ""
        );
    }

    private String extractTextFromGemini(Map<String, Object> response) {
        var candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            var content = (Map<String, Object>) candidates.get(0).get("content");
            var parts = (List<Map<String, Object>>) content.get("parts");
            if (parts != null && !parts.isEmpty()) {
                return (String) parts.get(0).get("text");
            }
        }
        return "{}";
    }

    private String cleanJsonFromMarkdown(String responseText) {
        return responseText.replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();
    }

    private ProductGenerateResponse parseGeminiResponse(String responseText) {
        String json = cleanJsonFromMarkdown(responseText);
        try {
            return objectMapper.readValue(json, ProductGenerateResponse.class);
        } catch (Exception e) {
            log.error("❌ Ошибка парсинга JSON-ответа Gemini:\n{}", json, e);
            throw new RuntimeException("Ошибка парсинга ответа от Gemini: " + e.getMessage());
        }
    }
}