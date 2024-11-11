package com.project.eventhub.logic.entity.rol;

import com.project.eventhub.logic.entity.vendor.Vendor;
import com.project.eventhub.logic.entity.vendor.VendorRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import com.project.eventhub.logic.entity.VendorCategory.VendorCategory;
import com.project.eventhub.logic.entity.VendorCategory.VendorCategoryRepository;
import com.project.eventhub.logic.entity.VendorService.Vendor_service;
import com.project.eventhub.logic.entity.VendorService.VendorServiceRepository;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Component
public class VendorSeeders implements ApplicationListener<ContextRefreshedEvent> {
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final VendorCategoryRepository vendorCategoryRepository;
    private final VendorServiceRepository vendorServiceRepository;

    public VendorSeeders(
            VendorRepository vendorRepository,
            UserRepository userRepository,
            VendorCategoryRepository vendorCategoryRepository,
            VendorServiceRepository vendorServiceRepository
    ) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.vendorCategoryRepository = vendorCategoryRepository;
        this.vendorServiceRepository = vendorServiceRepository;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        //this.createVendors();
    }
//
//    private void createVendors() {
//        List<User> users = userRepository.findAll();
//        List<VendorCategory> categories = vendorCategoryRepository.findAll();
//
//        if (users.isEmpty() || categories.isEmpty()) {
//            return;
//        }
//        Random random = new Random();
//
//        for (int i = 1; i <= 5; i++) {
//            String vendorName = "Vendor" + System.currentTimeMillis() + i;
//            Optional<Vendor> optionalVendor = vendorRepository.findByName(vendorName);
//
//            if (optionalVendor.isPresent()) {
//                continue;
//            }
//
//            User randomUser = users.get(random.nextInt(users.size()));
//            VendorCategory randomCategory = categories.get(random.nextInt(categories.size()));
//
//            Vendor vendor = new Vendor();
//            vendor.setName(vendorName);
//            vendor.setDescription("Description for " + vendorName);
//            vendor.setLocation("Location " + i);
//            vendor.setRating(4.5);
//            vendor.setPhone("123-456-789" + System.currentTimeMillis() + i);
//            vendor.setUser(randomUser);
//            vendor.setVendorCategory(randomCategory);
//
//            vendorRepository.save(vendor);
//
//            createVendorServices(vendor);
//        }
//    }
//
//    private void createVendorServices(Vendor vendor) {
//        Random random = new Random();
//        String[] serviceNames = {"Cleaning", "Catering", "Security", "Transport", "Decoration"};
//        String[] descriptions = {"High quality", "Affordable", "Premium", "Reliable", "Efficient"};
//
//        for (int i = 1; i <= 3; i++) {
//            Vendor_service service = new Vendor_service();
//            service.setService_name(serviceNames[random.nextInt(serviceNames.length)] + " for " + vendor.getName());
//            service.setDescription(descriptions[random.nextInt(descriptions.length)] + " service for " + vendor.getName());
//            service.setPrice(50.0 + (3000.0 - 50.0) * random.nextDouble()); // Random price between 50.0 and 3000.0
//            service.setAvailable(random.nextBoolean());
//            service.setVendor(vendor);
//
//            vendorServiceRepository.save(service);
//        }
//    }
}