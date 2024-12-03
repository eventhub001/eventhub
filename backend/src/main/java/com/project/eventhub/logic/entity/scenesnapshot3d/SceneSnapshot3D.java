package com.project.eventhub.logic.entity.scene3d;

import com.project.eventhub.logic.entity.models.Model;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

@Table(name = "scene3d")
@Entity
public class SceneSnapshot3D {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;


    @Column(name = "description")
    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    @Column(name = "row")
    private int row;

    @Column(name = "floor")
    private int floor;

    @Column(name = "col")
    private int col;

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    public int getFloor() {
        return floor;
    }

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public int getCol() {
        return col;
    }

    public void setCol(int col) {
        this.col = col;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Model getModel() {
        return model;
    }

    public void setModel(Model model) {
        this.model = model;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
