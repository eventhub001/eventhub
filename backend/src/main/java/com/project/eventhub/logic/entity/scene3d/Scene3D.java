package com.project.eventhub.logic.entity.scene3d;

import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3D;
import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3DRepository;
import com.project.eventhub.logic.entity.setting.Setting;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

@Table(name = "scene3D")
@Entity
public class Scene3D {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "description")
    private String description;

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


}
