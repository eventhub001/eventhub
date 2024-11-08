package com.project.eventhub.rest.websocket;


import com.project.eventhub.logic.entity.chat.Chat;
import com.project.eventhub.logic.entity.chat.ChatRepository;
import com.project.eventhub.logic.entity.message.Message;
import com.project.eventhub.logic.entity.message.MessageRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDateTime;


@Controller
public class WebSocketController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;


    @Autowired
    private ChatRepository chatRepository;
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/{roomId}")
    @PostMapping
    public Chat chatting(@DestinationVariable String roomId, Chat chat) {
        User user = userRepository.findById(chat.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        chat.setUser(user);

        // Save the chat entity if it's new
        if (chat.getId() == null) {
            chatRepository.save(chat);
        }

        // Create a new message
        Message message = new Message();
        message.setChat(chat);
        message.setText(chat.getMessage());
        message.setSentDate(LocalDateTime.now());

        // Save the message to the repository
        messageRepository.save(message);

        System.out.println("Message: " + chat.getMessage());
        System.out.println("Chat object: " + chat); // Agrega este registro para depurar

        return new Chat(chat.getMessage(), chat.getUser());
    }



}
