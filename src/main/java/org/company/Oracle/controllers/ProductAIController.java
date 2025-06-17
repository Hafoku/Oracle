package org.company.Oracle.controllers;

import org.company.Oracle.dto.ProductGenerateRequest;
import org.company.Oracle.dto.ProductGenerateResponse;
import org.company.Oracle.services.ProductAIService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*") // при необходимости, ограничь
public class ProductAIController {

    private final ProductAIService productAIService;

    public ProductAIController(ProductAIService productAIService) {
        this.productAIService = productAIService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ProductGenerateResponse> generate(@RequestBody ProductGenerateRequest request) {
        System.out.println("Получен запрос на генерацию: " + request.getName());
        if (request.getName() == null || request.getName().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ProductGenerateResponse response = productAIService.generateProduct(request);
        return ResponseEntity.ok(response);
    }
}
