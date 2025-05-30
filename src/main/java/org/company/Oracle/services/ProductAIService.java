package org.company.Oracle.services;

import org.company.Oracle.dto.ProductGenerateResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class ProductAIService {

    private final List<String> types = List.of(
            "first-aid", "equipment", "medicine", "prescription", "otc", "supplements"
    );

    public ProductGenerateResponse generateProduct(String name) {
        Random random = new Random();

        String description = "Автоматически сгенерированное описание для " + name;
        int price = random.nextInt(9000) + 1000;
        String type = types.get(random.nextInt(types.size()));
        String imageUrl = "https://via.placeholder.com/300"; // или вызывать внешний API для генерации

        return new ProductGenerateResponse(description, price, type, imageUrl);
    }
}
