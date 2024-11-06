package com.project.eventhub.rest.chat;


import com.project.eventhub.logic.entity.chat.Chat;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController

@CrossOrigin(origins = "localhost:4200/", allowCredentials = "true")
public class ChatRestController {


    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public Chat sendMessage(Chat message) {
        return message;
    }

}
