package org.company.Oracle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsDto {
    private String title;
    private String description;
    private String content;
    private List<Long> images;
    private Long avatar;
}
