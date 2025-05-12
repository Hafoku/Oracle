package org.company.Oracle.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "news")
@Entity
@Builder
public class News {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название новости не может быть пустой")
    private String title;

    @NotBlank(message = "Описание новости не может быть пустой")
    private String description;

    @NotBlank(message = "Контент новости не может быть пустой")
    @Column(length = 10000)
    private String content;

    private LocalDateTime dateOfCreation;

    @PrePersist
    protected void onCreate() {
        dateOfCreation = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @OneToMany(mappedBy = "news", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<ProfilePicture> images = new ArrayList<>();

    @JoinColumn(name = "avatar_id")
    @OneToOne(cascade = CascadeType.REMOVE)
    private ProfilePicture avatar;
}
