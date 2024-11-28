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

    @Column(name = "width")
    private float width;

    @Column(name = "height")
    private float height;

    @Column(name = "depth")
    private float depth;

    @Column(name = "x")
    private float x;

    @Column(name = "y")
    private float y;

    @Column(name = "z")
    private float z;

    @Column(name = "frontx")
    private float frontx;

    @Column(name = "fronty")
    private float fronty;

    @Column(name = "frontz")
    private float frontz;

    @Column(name = "backx")
    private float backx;

    @Column(name = "backy")
    private float backy;

    @Column(name = "backz")
    private float backz;

    @Column(name = "topx")
    private float topx;

    @Column(name = "topy")
    private float topy;

    @Column(name = "topz")
    private float topz;

    @Column(name = "bottomx")
    private float bottomx;

    @Column(name = "bottomy")
    private float bottomy;

    @Column(name = "bottomz")
    private float bottomz;

    @Column(name = "leftx")
    private float leftx;

    @Column(name = "lefty")
    private float lefty;

    @Column(name = "leftz")
    private float leftz;

    @Column(name = "rightx")
    private float rightx;

    @Column(name = "righty")
    private float righty;

    @Column(name = "rightz")
    private float rightz;

    @Column(name = "type")
    private String type;

    public float getWidth() {
        return width;
    }

    public void setWidth(float width) {
        this.width = width;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height) {
        this.height = height;
    }

    public float getDepth() {
        return depth;
    }

    public void setDepth(float depth) {
        this.depth = depth;
    }

    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public float getZ() {
        return z;
    }

    public void setZ(float z) {
        this.z = z;
    }

    public float getFrontx() {
        return frontx;
    }

    public void setFrontx(float frontx) {
        this.frontx = frontx;
    }

    public float getFronty() {
        return fronty;
    }

    public void setFronty(float fronty) {
        this.fronty = fronty;
    }

    public float getFrontz() {
        return frontz;
    }

    public void setFrontz(float frontz) {
        this.frontz = frontz;
    }

    public float getBackx() {
        return backx;
    }

    public void setBackx(float backx) {
        this.backx = backx;
    }

    public float getBacky() {
        return backy;
    }

    public void setBacky(float backy) {
        this.backy = backy;
    }

    public float getBackz() {
        return backz;
    }

    public void setBackz(float backz) {
        this.backz = backz;
    }

    public float getTopx() {
        return topx;
    }

    public void setTopx(float topx) {
        this.topx = topx;
    }

    public float getTopy() {
        return topy;
    }

    public void setTopy(float topy) {
        this.topy = topy;
    }

    public float getTopz() {
        return topz;
    }

    public void setTopz(float topz) {
        this.topz = topz;
    }

    public float getBottomx() {
        return bottomx;
    }

    public void setBottomx(float bottomx) {
        this.bottomx = bottomx;
    }

    public float getBottomy() {
        return bottomy;
    }

    public void setBottomy(float bottomy) {
        this.bottomy = bottomy;
    }

    public float getBottomz() {
        return bottomz;
    }

    public void setBottomz(float bottomz) {
        this.bottomz = bottomz;
    }

    public float getLeftx() {
        return leftx;
    }

    public void setLeftx(float leftx) {
        this.leftx = leftx;
    }

    public float getLefty() {
        return lefty;
    }

    public void setLefty(float lefty) {
        this.lefty = lefty;
    }

    public float getLeftz() {
        return leftz;
    }

    public void setLeftz(float leftz) {
        this.leftz = leftz;
    }

    public float getRightx() {
        return rightx;
    }

    public void setRightx(float rightx) {
        this.rightx = rightx;
    }

    public float getRighty() {
        return righty;
    }

    public void setRighty(float righty) {
        this.righty = righty;
    }

    public float getRightz() {
        return rightz;
    }

    public void setRightz(float rightz) {
        this.rightz = rightz;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

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
