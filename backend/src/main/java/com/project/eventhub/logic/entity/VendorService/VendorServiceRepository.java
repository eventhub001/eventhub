package com.project.eventhub.logic.entity.VendorService;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorServiceRepository extends JpaRepository<Vendor_service, Integer> {

    List<Vendor_service> findByVendorId(Integer vendorId);










}
