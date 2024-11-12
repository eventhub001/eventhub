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
    public Chat chatting(@DestinationVariable Integer roomId, Chat chat) {
        User user = userRepository.findById(chat.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        chat.setUser(user);

        chat.setRoomId(roomId);
        System.out.println(roomId);

        // Check if the chat already exists in the database
        if (chat.getId() != null) {
            Chat existingChat = chatRepository.findById(chat.getId()).orElse(null);
            if (existingChat != null) {
                chat = existingChat;
            } else {
                chatRepository.save(chat);
            }
        } else {
            chatRepository.save(chat);
        }

        // Create a new message
        Message message = new Message();
        message.setChat(chat);
        message.setText(chat.getMessage());
        message.setSentDate(LocalDateTime.now());

        // Save the message to the repository
        messageRepository.save(message);

        return new Chat(chat.getMessage(), chat.getUser(), chat.getRoomId());
    }


















    
}
