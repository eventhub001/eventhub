package com.project.eventhub.logic.entity.VendorCategory;


import jakarta.persistence.*;

import java.sql.Array;
import java.util.List;

@Entity
@Table(name = "vendor_category")
public class VendorCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @Column(name = "category_name")
    private String categoryName;
    private String description;


    public VendorCategory() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String category_name) {
        this.categoryName = category_name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }



}
