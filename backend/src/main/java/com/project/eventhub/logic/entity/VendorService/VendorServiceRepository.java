package com.project.eventhub.logic.entity.VendorService;


import com.project.eventhub.logic.entity.vendor.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorServiceRepository extends JpaRepository<Vendor_service, Integer> {

    List<Vendor_service> findByVendorId(Integer vendorId);



    Page<Vendor_service> findByVendorId(Integer vendorId, Pageable pageable);







}
