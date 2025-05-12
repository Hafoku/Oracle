package org.company.Oracle.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "profile_picture")
@Getter
@Setter
public class ProfilePicture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String type;

    private String filePath;

    private Integer fileSize;

    @OneToOne(mappedBy = "avatar")
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "news_id")
    @JsonIgnore
    private News news;

}
