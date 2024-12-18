package com.project.eventhub.rest.vendor;


import com.project.eventhub.logic.entity.vendorservice.VendorServiceRepository;
import com.project.eventhub.logic.entity.vendorservice.Vendor_service;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/vendor")
public class VendorRestController {


    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorServiceRepository vendorServiceRepository;

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

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getVendorbyUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Optional<User> foundUser = userRepository.findById(userId);
        if (foundUser.isPresent()) {

            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Vendor> vendorPage = vendorRepository.getVendorByUserId(userId, pageable);
            Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
            meta.setTotalPages(vendorPage.getTotalPages());
            meta.setTotalElements(vendorPage.getTotalElements());
            meta.setPageNumber(vendorPage.getNumber() + 1);
            meta.setPageSize(vendorPage.getSize());

            List<Vendor_service> allServices = new ArrayList<>();
            for (Vendor vendor : vendorPage.getContent()) {
                List<Vendor_service> services = vendorServiceRepository.findByVendorId(vendor.getId());
                allServices.addAll(services);
            }

            return new GlobalResponseHandler().handleResponse("Vendor services retrieved successfully",
                    allServices, HttpStatus.OK, meta);

        } else {
            return new GlobalResponseHandler().handleResponse("User Id " + userId + " not found",
                    HttpStatus.NOT_FOUND, request);
        }
    }


    @GetMapping("/user/{userId}/vendors")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getVendorsByUserId(@PathVariable Long userId, HttpServletRequest request) {
        Optional<User> foundUser = userRepository.findById(userId);
        if (foundUser.isPresent()) {
            List<Vendor> vendors = vendorRepository.findByUserId(userId);
            Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
            return new GlobalResponseHandler().handleResponse("Vendors retrieved successfully", vendors, HttpStatus.OK, meta);
        } else {
            return new GlobalResponseHandler().handleResponse("User Id " + userId + " not found", HttpStatus.NOT_FOUND, request);
        }
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

    @GetMapping("/{vendorId}/services")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getServicesByVendorId(
            @PathVariable Integer vendorId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Optional<Vendor> foundVendor = vendorRepository.findById(vendorId);
        if (foundVendor.isPresent()) {

            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Vendor_service> servicePage = vendorServiceRepository.findByVendorId(vendorId, pageable);
            Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
            meta.setTotalPages(servicePage.getTotalPages());
            meta.setTotalElements(servicePage.getTotalElements());
            meta.setPageNumber(servicePage.getNumber() + 1);
            meta.setPageSize(servicePage.getSize());

            return new GlobalResponseHandler().handleResponse("Vendor services retrieved successfully",
                    servicePage.getContent(), HttpStatus.OK, meta);

        } else {
            return new GlobalResponseHandler().handleResponse("Vendor Id " + vendorId + " not found",
                    HttpStatus.NOT_FOUND, request);
        }
    }

}
