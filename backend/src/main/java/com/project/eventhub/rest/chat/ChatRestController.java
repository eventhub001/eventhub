package com.project.eventhub.rest.chat;



import com.project.eventhub.logic.entity.chat.Chat;
import com.project.eventhub.logic.entity.chat.ChatRepository;
import com.project.eventhub.logic.entity.event.Event;
import com.project.eventhub.logic.entity.task.Task;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


public class ChatRestController {
//
//    @Autowired
//    private ChatRepository chatRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @PostMapping
//    public Chat addMessage(@RequestBody Chat chat) {
//        User user = userRepository.findById(chat.getUser().getId())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        chat.setUser(user);
//        return chatRepository.save(chat);
//
//    }
//
//
//
//    @GetMapping
//    public List<Chat> getAllMessages() {
//        return chatRepository.findAll();
//    }








}
