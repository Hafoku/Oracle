package org.company.Oracle.services;

import lombok.RequiredArgsConstructor;
import org.company.Oracle.dto.ChatMessageDto;
import org.company.Oracle.models.ChatHistory;
import org.company.Oracle.repositories.ChatHistoryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;

    public void saveChatMessage(ChatMessageDto dto) {
        Long userId = getCurrentUserIdOrNull(); // может вернуть null

        if (userId != null) {
            ChatHistory chat = ChatHistory.builder()
                    .userId(userId)
                    .question(dto.getQuestion())
                    .answer(dto.getAnswer())
                    .createdAt(LocalDateTime.now())
                    .build();

            chatHistoryRepository.save(chat);
        }
    }

    public List<ChatHistory> getUserChatHistory() {
        Long userId = getCurrentUserIdOrNull();
        if (userId == null) {
            throw new IllegalStateException("Пользователь не авторизован");
        }

        return chatHistoryRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    private Long getCurrentUserIdOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String name = authentication.getName();
        if ("anonymousUser".equals(name)) {
            return null;
        }

        try {
            return Long.parseLong(name);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
