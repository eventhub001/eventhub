package com.project.eventhub.logic.entity.vendorcategory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface VendorCategoryRepository extends JpaRepository<VendorCategory, Integer> {

    List<VendorCategory> findByCategoryName(String categoryName);

}
