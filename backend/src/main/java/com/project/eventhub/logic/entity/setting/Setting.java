package com.project.eventhub.logic.entity.setting;

import com.project.eventhub.logic.entity.scene3d.Scene3D;
import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3D;
import com.project.eventhub.logic.entity.settingoption.SettingOption;
import com.project.eventhub.logic.entity.user.User;
import jakarta.persistence.*;

@Table(name = "setting")
@Entity
public class Setting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "scene_id", nullable = false)
    private Scene3D scene3D;

    @ManyToOne
    @JoinColumn(name = "setting_option_id", nullable = false)
    private SettingOption settingOption;

    @Column(name = "value")
    private String value;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public SettingOption getSettingOption() {
        return settingOption;
    }

    public void setSettingOption(SettingOption settingOption) {
        this.settingOption = settingOption;
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

    public Scene3D getScene3D() {
        return scene3D;
    }

    public void setScene3D(Scene3D scene3D) {
        this.scene3D = scene3D;
    }
}
