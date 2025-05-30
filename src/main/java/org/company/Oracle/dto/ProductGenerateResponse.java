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
    private String type;
    private String imageUrl;
}
