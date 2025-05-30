package org.company.Oracle.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductGenerateResponse {
    private String description;
    private int price;
    private String detectType(String name) {
        String lower = name.toLowerCase();
        if (lower.contains("бинт") || lower.contains("пластырь")) return "first-aid";
        if (lower.contains("термометр") || lower.contains("тонометр")) return "equipment";
        if (lower.contains("аспирин") || lower.contains("парацетамол") || lower.contains("анальгин")) return "medicine";
        if (lower.contains("рецепт") || lower.contains("инсулин")) return "prescription";
        if (lower.contains("витамин") || lower.contains("омега")) return "supplements";
        return "otc"; // по умолчанию
    }
    private String imageUrl;
}
