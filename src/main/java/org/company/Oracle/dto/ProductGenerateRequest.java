package org.company.Oracle.dto;

import lombok.Data;

@Data
public class ProductGenerateRequest {
    private String name;
    private String context;
    private String language;
}
