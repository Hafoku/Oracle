package org.company.Oracle.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название продукта не может быть пустым")
    private String name;

    @NotNull(message = "Цена продукта не может быть пустой")
    @Min(value = 1, message = "Цена должна быть больше 0")
    private Integer price;

    @NotBlank(message = "Описание продукта не может быть пустым")
    private String description;

    @NotBlank(message = "Тип продукта не может быть пустым")
    private String type;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    @JsonIgnore
    private User creator;

    @JoinColumn(name = "avatar_id")
    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private ProfilePicture avatar;
}
