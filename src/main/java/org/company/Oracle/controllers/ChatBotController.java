package org.company.Oracle.controllers;

import lombok.RequiredArgsConstructor;
import org.company.Oracle.dto.ChatMessageDto;
import org.company.Oracle.services.ChatBotService;
import org.company.Oracle.services.ChatHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatBotController {

    private final ChatBotService chatBotService;
    private final ChatHistoryService chatHistoryService;

    @PostMapping("/message")
    public ResponseEntity<ChatMessageDto> processMessage(@RequestBody ChatMessageDto dto) {
        String answer = chatBotService.ask(dto.getQuestion());

        ChatMessageDto response = ChatMessageDto.builder()
                .question(dto.getQuestion())
                .answer(answer)
                .build();

        chatHistoryService.saveChatMessage(response);

        return ResponseEntity.ok(response);
    }
}