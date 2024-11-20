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
import java.util.UUID;

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
//        this.createCategories();
//        this.createVendors();

    }

    private void createCategories() {
        String[] categoryNames = {
                "Comida", "Entretenimiento", "Decoración", "Seguridad", "Transporte",
                "Fotografía", "Música", "Iluminación", "Sonido", "Flores",
                "Bebidas", "Animación", "Juegos", "Vestuario", "Invitaciones",
                "Recuerdos", "Pasteles", "Catering", "Limpieza", "Logística",
                "Alquiler de equipos", "Planificación", "Coordinación", "Publicidad", "Marketing",
                "Diseño gráfico", "Redes sociales", "Video", "Streaming", "Conferencias"
        };
        String[] descriptions = {
                "Deliciosa comida", "Entretenimiento divertido", "Decoración hermosa", "Seguridad confiable", "Transporte eficiente",
                "Fotografía profesional", "Música en vivo", "Iluminación espectacular", "Sonido de calidad", "Flores frescas",
                "Bebidas variadas", "Animación para todos", "Juegos interactivos", "Vestuario elegante", "Invitaciones creativas",
                "Recuerdos únicos", "Pasteles deliciosos", "Catering completo", "Limpieza impecable", "Logística precisa",
                "Alquiler de equipos", "Planificación detallada", "Coordinación perfecta", "Publicidad efectiva", "Marketing estratégico",
                "Diseño gráfico", "Gestión de redes sociales", "Producción de video", "Streaming en vivo", "Organización de conferencias"
        };

        for (int i = 0; i < categoryNames.length; i++) {
            VendorCategory category = new VendorCategory();
            category.setCategory_name(categoryNames[i]);
            category.setDescription(descriptions[i]);

            vendorCategoryRepository.save(category);
        }
    }

    private void createVendors() {
        List<User> users = userRepository.findAll();
        List<VendorCategory> categories = vendorCategoryRepository.findAll();
        String[] locations = {
                "San José, San José", "San José, Escazú", "San José, Desamparados", "San José, Puriscal", "San José, Tarrazú",
                "Alajuela, Alajuela", "Alajuela, San Ramón", "Alajuela, Grecia", "Alajuela, San Mateo", "Alajuela, Atenas",
                "Cartago, Cartago", "Cartago, Paraíso", "Cartago, La Unión", "Cartago, Jiménez", "Cartago, Turrialba",
                "Heredia, Heredia", "Heredia, Barva", "Heredia, Santo Domingo", "Heredia, Santa Bárbara", "Heredia, San Rafael",
                "Guanacaste, Liberia", "Guanacaste, Nicoya", "Guanacaste, Santa Cruz", "Guanacaste, Bagaces", "Guanacaste, Carrillo",
                "Puntarenas, Puntarenas", "Puntarenas, Esparza", "Puntarenas, Buenos Aires", "Puntarenas, Montes de Oro", "Puntarenas, Osa",
                "Limón, Limón", "Limón, Pococí", "Limón, Siquirres", "Limón, Talamanca", "Limón, Matina"
        };

        if (users.isEmpty() || categories.isEmpty()) {
            return;
        }

        Random random = new Random();

        for (int i = 1; i <= 30; i++) {
            VendorCategory randomCategory = categories.get(random.nextInt(categories.size()));
            String vendorName = generateVendorName(randomCategory.getCategory_name());
            Optional<Vendor> optionalVendor = vendorRepository.findByName(vendorName);

            if (optionalVendor.isPresent()) {
                continue;
            }

            User randomUser = users.get(random.nextInt(users.size()));
            String location = locations[random.nextInt(locations.length)];

            Vendor vendor = new Vendor();
            vendor.setName(vendorName);
            vendor.setDescription("Proveedor de " + randomCategory.getCategory_name() + " en " + location);
            vendor.setLocation(location);
            vendor.setRating(4.5);
            vendor.setPhone("123-456-" + generateRandomDigits(4));
            vendor.setUser(randomUser);
            vendor.setVendorCategory(randomCategory);

            vendorRepository.save(vendor);

            createVendorServices(vendor, randomCategory.getCategory_name());
        }
    }

    private void createVendorServices(Vendor vendor, String categoryName) {
        Random random = new Random();
        String[][] services = {
                {"Limpieza", "Servicio de limpieza para " + categoryName},
                {"Catering", "Servicio de catering para " + categoryName},
                {"Seguridad", "Servicio de seguridad para " + categoryName},
                {"Transporte", "Servicio de transporte para " + categoryName},
                {"Decoración", "Servicio de decoración para " + categoryName},
                {"Fotografía", "Servicio de fotografía para " + categoryName},
                {"Música", "Servicio de música para " + categoryName},
                {"Iluminación", "Servicio de iluminación para " + categoryName},
                {"Sonido", "Servicio de sonido para " + categoryName},
                {"Flores", "Servicio de flores para " + categoryName},
                {"Bebidas", "Servicio de bebidas para " + categoryName},
                {"Animación", "Servicio de animación para " + categoryName},
                {"Juegos", "Servicio de juegos para " + categoryName},
                {"Vestuario", "Servicio de vestuario para " + categoryName},
                {"Invitaciones", "Servicio de invitaciones para " + categoryName},
                {"Recuerdos", "Servicio de recuerdos para " + categoryName},
                {"Pasteles", "Servicio de pasteles para " + categoryName},
                {"Planificación", "Servicio de planificación para " + categoryName},
                {"Coordinación", "Servicio de coordinación para " + categoryName},
                {"Publicidad", "Servicio de publicidad para " + categoryName},
                {"Marketing", "Servicio de marketing para " + categoryName},
                {"Diseño gráfico", "Servicio de diseño gráfico para " + categoryName},
                {"Redes sociales", "Servicio de gestión de redes sociales para " + categoryName},
                {"Video", "Servicio de producción de video para " + categoryName},
                {"Streaming", "Servicio de streaming para " + categoryName},
                {"Conferencias", "Servicio de organización de conferencias para " + categoryName},
                {"Alquiler de equipos", "Servicio de alquiler de equipos para " + categoryName},
                {"Logística", "Servicio de logística para " + categoryName},
                {"Organización de eventos", "Servicio de organización de eventos para " + categoryName},
                {"Asesoría", "Servicio de asesoría para " + categoryName}
        };

        for (int i = 1; i <= 3; i++) {
            String[] service = services[random.nextInt(services.length)];
            Vendor_service vendorService = new Vendor_service();
            vendorService.setService_name(service[0] + " para " + categoryName);
            vendorService.setDescription(service[1]);
            vendorService.setPrice(50.0 + (3000.0 - 50.0) * random.nextDouble()); // Precio aleatorio entre 50.0 y 3000.0
            vendorService.setAvailable(random.nextBoolean());
            vendorService.setVendor(vendor);

            vendorServiceRepository.save(vendorService);
        }
    }

    private String generateVendorName(String categoryName) {
        String[] vendorPrefixes = {"Proveedor", "Servicio", "Empresa", "Compañía", "Negocio"};
        Random random = new Random();
        return vendorPrefixes[random.nextInt(vendorPrefixes.length)] + " de " + categoryName;
    }

    private String generateRandomDigits(int length) {
        String digits = "0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(digits.charAt(random.nextInt(digits.length())));
        }
        return sb.toString();
    }
}