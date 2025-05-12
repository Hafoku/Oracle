package org.company.Oracle.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Builder
@Getter
@Setter
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Имя не может быть пустым")
    @Column
    private String name;
    @Email(message = "Некорректный адрес почты")
    @Column
    private String email;
    @NotBlank
    private String password;
    @ManyToOne
    @JoinColumn(name="role_id", nullable = false)
    private Role role;

    @OneToOne
    @JoinColumn(name = "avatar_id")
    private ProfilePicture avatar;
}
