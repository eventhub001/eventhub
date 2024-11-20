package com.project.eventhub.rest.Webhook;

import com.project.eventhub.logic.entity.VendorCategory.VendorCategory;
import com.project.eventhub.logic.entity.VendorCategory.VendorCategoryRepository;
import com.project.eventhub.logic.entity.vendor.Vendor;
import com.project.eventhub.logic.entity.vendor.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/webhook")
public class DialogflowWebhookController {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VendorCategoryRepository vendorCategoryRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> handleDialogflowWebhook(@RequestBody Map<String, Object> request) {
        String userQuery = (String) ((Map) request.get("queryResult")).get("queryText");
        List<Map<String, Object>> fulfillmentMessages = new ArrayList<>();
        String responseText = "Parece que estás organizando una boda. Te puedo ayudar con sugerencias de proveedores.";
        List<Map<String, String>> vendorMessages;

        if (userQuery.toLowerCase().contains("boda")) {
            // Obtener las categorías de proveedores
            List<VendorCategory> cakeCategories = vendorCategoryRepository.findByCategoryName("Pasteles");
            List<VendorCategory> decorationCategories = vendorCategoryRepository.findByCategoryName("Decoración");
            List<VendorCategory> cateringCategories = vendorCategoryRepository.findByCategoryName("Catering");

            // Crear una lista de proveedores
            List<Vendor> vendors = new ArrayList<>();
            for (VendorCategory category : cakeCategories) {
                vendors.addAll(vendorRepository.findByVendorCategory(category));
            }
            for (VendorCategory category : decorationCategories) {
                vendors.addAll(vendorRepository.findByVendorCategory(category));
            }
            for (VendorCategory category : cateringCategories) {
                vendors.addAll(vendorRepository.findByVendorCategory(category));
            }

            // Crear los mensajes de tarjeta para los proveedores
            vendorMessages = vendors.stream()
                    .map(vendor -> Map.of(
                            "type", "info",  // Tipo de tarjeta
                            "title", vendor.getName(),  // Nombre del proveedor
                            "subtitle", vendor.getDescription(),  // Descripción del proveedor
                            "actionLink", "http://localhost:4200/app/details/" + vendor.getId()  // Enlace al proveedor
                    ))
                    .collect(Collectors.toList());

            // Si se encontraron proveedores, agregar los mensajes al fulfillment
            if (!vendorMessages.isEmpty()) {
                fulfillmentMessages.add(Map.of(
                        "payload", Map.of(
                                "richContent", List.of(vendorMessages)  // Formato correcto para las tarjetas
                        )
                ));

                // Agregar primero el texto, luego las tarjetas
                Map<String, Object> response = Map.of(
                        "fulfillmentText", responseText,  // El mensaje de texto primero
                        "fulfillmentMessages", List.of(
                                Map.of("text", Map.of("text", List.of(responseText))),  // El mensaje de texto debe ir aquí también
                                Map.of("payload", Map.of(
                                        "richContent", List.of(vendorMessages)  // Las tarjetas van después
                                ))
                        )
                );
                return ResponseEntity.ok(response);
            }
        }

        // Si no se encontraron proveedores, devolver respuesta por defecto
        return ResponseEntity.ok(Map.of(
                "fulfillmentText", "No se encontraron proveedores.",
                "fulfillmentMessages", new ArrayList<>()
        ));
    }
}
