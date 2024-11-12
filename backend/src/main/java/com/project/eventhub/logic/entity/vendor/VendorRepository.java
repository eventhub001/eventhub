

package com.project.eventhub.logic.entity.vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, Integer> {


    Page<Vendor> getVendorByUserId(Long userId, Pageable pageable);
}