package com.project.eventhub.logic.entity.textures;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Component
public class TextureSeeder implements ApplicationListener<ContextRefreshedEvent> {
    private final TextureRepository modelRepository;


    public TextureSeeder(
            TextureRepository modelRepository
    ) {
        this.modelRepository = modelRepository;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
//        this.createTextures();
    }

    private void createTextures() {
        Texture model = new Texture();
        model.setTexturePath("floor.texture.default.jpg");
        modelRepository.save(model);
    }
}
