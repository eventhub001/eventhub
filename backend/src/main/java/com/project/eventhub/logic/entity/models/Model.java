package com.project.eventhub.logic.entity.models;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Table(name = "model")
@Entity
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

    @Column(name = "model_path")
    private String modelPath;

    @Column(name = "model_img_path")
    private String modelImgPath;

    @Column(name = "model_texture_path")
    private String modelTexturePath;

    public String getModelTexturePath() {
        return modelTexturePath;
    }

    public void setModelTexturePath(String modelTexturePath) {
        this.modelTexturePath = modelTexturePath;
    }

    public String getModelPath() {
        return modelPath;
    }

    public void setModelPath(String modelPath) {
        this.modelPath = modelPath;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModelImgPath() {
        return modelImgPath;
    }

    public void setModelImgPath(String modelImgPath) {
        this.modelImgPath = modelImgPath;
    }
}
