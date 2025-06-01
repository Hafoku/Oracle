package org.company.Oracle.repositories;

import org.company.Oracle.models.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}
