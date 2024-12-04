package com.project.eventhub.logic.entity.settingoption;

import jakarta.persistence.*;

@Table(name = "setting_option")
@Entity
public class SettingOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "json_key")
    private String key;

    @Column(name = "datatype")
    private String datatype;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDatatype() {
        return datatype;
    }

    public void setDatatype(String datatype) {
        this.datatype = datatype;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}
