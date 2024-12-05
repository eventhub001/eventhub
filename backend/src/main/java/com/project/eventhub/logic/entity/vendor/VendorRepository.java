

package com.project.eventhub.logic.entity.vendor;
import com.project.eventhub.logic.entity.vendorCategory.VendorCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Integer> {


    Page<Vendor> getVendorByUserId(Long userId, Pageable pageable);
    List<Vendor> findByUserId(Long userId);
    Optional<Vendor> findByName(String vendorName);


    List<Vendor> findByVendorCategory(VendorCategory vendorCategory);


}