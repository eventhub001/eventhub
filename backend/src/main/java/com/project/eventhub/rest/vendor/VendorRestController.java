package com.project.eventhub.rest.vendor;


import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
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
@RequestMapping("/vendor")
public class VendorRestController {


    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole( 'SUPER_ADMIN')")
    public Vendor addvendor(@RequestBody Vendor vendor) {
        User user = userRepository.findById(vendor.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        vendor.setUser(user);
        return vendorRepository.save(vendor);
    }


    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllVendors(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page-1, size);
        Page<Vendor> vendorPage = vendorRepository.findAll(pageable);
        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(vendorPage.getTotalPages());
        meta.setTotalElements(vendorPage.getTotalElements());
        meta.setPageNumber(vendorPage.getNumber() + 1);
        meta.setPageSize(vendorPage.getSize());

        return new GlobalResponseHandler().handleResponse("Vendors retrieved successfully",
                vendorPage.getContent(), HttpStatus.OK, meta);
    }


    @PutMapping("/{id}")
    public Vendor updateVendor(@PathVariable Integer id, @RequestBody Vendor vendor) {
        return vendorRepository.findById(id)
                .map(existingVendor -> {
                    Optional.ofNullable(vendor.getName()).ifPresent(existingVendor::setName);
                    Optional.ofNullable(vendor.getDescription()).ifPresent(existingVendor::setDescription);
                    Optional.ofNullable(vendor.getLocation()).ifPresent(existingVendor::setLocation);
                    Optional.ofNullable(vendor.getRating()).ifPresent(existingVendor::setRating);
                    Optional.ofNullable(vendor.getUser()).ifPresent(existingVendor::setUser);
                    User user = userRepository.findById(vendor.getUser().getId())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    existingVendor.setUser(user);
                    return vendorRepository.save(existingVendor);
                })
                .orElseGet(() -> {
                    User user = userRepository.findById(vendor.getUser().getId())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    vendor.setUser(user);
                    vendor.setId(id);
                    return vendorRepository.save(vendor);
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public void deleteVendor(@PathVariable Integer id) {
        vendorRepository.deleteById(id);
    }






}
