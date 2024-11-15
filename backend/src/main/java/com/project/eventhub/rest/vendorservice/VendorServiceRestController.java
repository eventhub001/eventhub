package com.project.eventhub.rest.vendorservice;

import com.project.eventhub.logic.entity.VendorService.Vendor_service;
import com.project.eventhub.logic.entity.VendorService.VendorServiceRepository;
import com.project.eventhub.logic.entity.vendor.Vendor;
import com.project.eventhub.logic.entity.vendor.VendorRepository;
import com.project.eventhub.logic.http.GlobalResponseHandler;
import com.project.eventhub.logic.http.Meta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/vendor_service")
public class VendorServiceRestController {

    @Autowired
    private VendorServiceRepository vendorServiceRepository;

    @Autowired
    private VendorRepository vendorRepository;


    @PostMapping
    @PreAuthorize("hasAnyRole( 'SUPER_ADMIN')")
    public Vendor_service addservice(@RequestBody Vendor_service vendorService) {
        Vendor vendor = vendorRepository.findById(vendorService.getVendor().getId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendorService.setVendor(vendor);
        return vendorServiceRepository.save(vendorService);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllVendorsServices(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page-1, size);
        Page<Vendor_service> vendorServicePage = vendorServiceRepository.findAll(pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(vendorServicePage.getTotalPages());
        meta.setTotalElements(vendorServicePage.getTotalElements());
        meta.setPageNumber(vendorServicePage.getNumber() + 1);
        meta.setPageSize(vendorServicePage.getSize());

        return new GlobalResponseHandler().handleResponse("Vendors retrieved successfully",
                vendorServicePage.getContent(), HttpStatus.OK, meta);
    }



















    @PutMapping("/{id}")
    public Vendor_service updateVendor(@PathVariable Integer id, @RequestBody Vendor_service vendorService) {
        return vendorServiceRepository.findById(id)
                .map(existingVendorService -> {
                    Optional.ofNullable(vendorService.getService_name()).ifPresent(existingVendorService::setService_name);
                    Optional.ofNullable(vendorService.getDescription()).ifPresent(existingVendorService::setDescription);
                    Optional.ofNullable(vendorService.getPrice()).ifPresent(existingVendorService::setPrice);
                    Optional.ofNullable(vendorService.getVendor()).ifPresent(existingVendorService::setVendor);

                    Vendor vendor = vendorRepository.findById(vendorService.getVendor().getId())
                            .orElseThrow(() -> new RuntimeException("Category not found"));
                    existingVendorService.setVendor(vendor);
                    return vendorServiceRepository.save(existingVendorService);
                })
                .orElseGet(() -> {
                    Vendor vendor = vendorRepository.findById(vendorService.getVendor().getId())
                            .orElseThrow(() -> new RuntimeException("Category not found"));
                    vendorService.setVendor(vendor);
                    vendorService.setId(id);
                    return vendorServiceRepository.save(vendorService);
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public void deleteVendor(@PathVariable Integer id) {
        vendorRepository.deleteById(id);
    }



}
