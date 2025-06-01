package org.company.Oracle.dto;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class ChatHistory {
    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private String question;
    private String answer;
    private LocalDateTime createdAt;
}
