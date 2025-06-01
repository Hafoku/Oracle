package org.company.Oracle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private String name;
    @Min(1)
    @NotNull
    private Integer price;
    private String description;
    private String type;
    private Long avatar;
}
