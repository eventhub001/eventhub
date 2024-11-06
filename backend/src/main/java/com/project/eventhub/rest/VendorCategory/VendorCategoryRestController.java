package com.project.eventhub.rest.VendorCategory;


import com.project.eventhub.logic.entity.VendorCategory.VendorCategory;
import com.project.eventhub.logic.entity.VendorCategory.VendorCategoryRepository;
import com.project.eventhub.logic.entity.VendorService.Vendor_service;
import com.project.eventhub.logic.entity.vendor.Vendor;
import com.project.eventhub.logic.http.GlobalResponseHandler;
import com.project.eventhub.logic.http.Meta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

@RestController
@RequestMapping("/vendor_category")
public class VendorCategoryRestController {

    @Autowired
    private VendorCategoryRepository vendorCategoryRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole( 'SUPER_ADMIN')")
    public VendorCategory addCategory(@RequestBody VendorCategory vendorCategory) {
        return vendorCategoryRepository.save(vendorCategory);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllVendorCategories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page-1, size);
        Page<VendorCategory> vendorcategoryPage = vendorCategoryRepository.findAll(pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(vendorcategoryPage.getTotalPages());
        meta.setTotalElements(vendorcategoryPage.getTotalElements());
        meta.setPageNumber(vendorcategoryPage.getNumber() + 1);
        meta.setPageSize(vendorcategoryPage.getSize());

        return new GlobalResponseHandler().handleResponse("Categories retrieved successfully",
                vendorcategoryPage.getContent(), HttpStatus.OK, meta);
    }


    @PutMapping("/{id}")
    public VendorCategory updateCategory(@PathVariable Integer id, @RequestBody VendorCategory vendorCategory) {
        return vendorCategoryRepository.findById(id)
                .map(existingVendorCategory -> {
                    Optional.ofNullable(vendorCategory.getCategory_name()).ifPresent(existingVendorCategory::setCategory_name);
                    Optional.ofNullable(vendorCategory.getDescription()).ifPresent(existingVendorCategory::setDescription);
                    return vendorCategoryRepository.save(existingVendorCategory);
                })
                .orElseGet(() -> {
                    vendorCategory.setId(id);
                    return vendorCategoryRepository.save(vendorCategory);
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public void deleteVendor(@PathVariable Integer id) {
        vendorCategoryRepository.deleteById(id);
    }



}
