package com.project.eventhub.rest.texture;

import com.project.eventhub.logic.entity.textures.Texture;
import com.project.eventhub.logic.entity.textures.TextureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

@RestController
@RequestMapping("/textures")
public class TextureRestController {

    @Autowired
    TextureRepository textureRepository;

    @GetMapping("files/{texture_name}")
    public FileSystemResource getTextureFile(@PathVariable("texture_name") String fileName) {
        // temporal storage, since this will be stored in AWS storage, or in a VM.
        return new FileSystemResource(new File("src\\main\\resources\\" + fileName));
    }

    @GetMapping("{id}")
    public Texture getTexturePath(@PathVariable Long id) {
        return textureRepository.findById(id).orElseThrow(RuntimeException::new);
    }
}