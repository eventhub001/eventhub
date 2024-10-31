package com.project.eventhub.logic.entity.models;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Component
public class ModelsSeeder implements ApplicationListener<ContextRefreshedEvent> {
    private final ModelRepository modelRepository;


    public ModelsSeeder(
            ModelRepository modelRepository
    ) {
        this.modelRepository = modelRepository;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        // this.createModels();
    }

    private void createModels() {
        Model model = new Model();
        model.setModelPath("table.glb");
        modelRepository.save(model);
    }
}
