package com.project.eventhub.rest.Cotizacion;


import com.project.eventhub.logic.entity.cotizacion.Cotizacion;
import com.project.eventhub.logic.entity.cotizacion.CotizacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cotizacion")
public class CotizacionRestController {

    @Autowired
    private CotizacionRepository cotizacionRepository;

    @GetMapping
    public List<Cotizacion> getAllCotizaciones() {
        return cotizacionRepository.findAll();
    }

    @PostMapping
    public Cotizacion createCotizacion(@RequestBody Cotizacion cotizacion) {
        return cotizacionRepository.save(cotizacion);
    }

    @PutMapping("/{id}")
    public Cotizacion updateCotizacion(@PathVariable Long id, @RequestBody Cotizacion cotizacionDetails) {
        Cotizacion cotizacion = (Cotizacion) cotizacionRepository.findById(id).orElseThrow(() -> new RuntimeException("Cotización no encontrada"));
        cotizacion.setEvent(cotizacionDetails.getEvent());
        cotizacion.setVendor_service(cotizacionDetails.getVendor_service());
        cotizacion.setMontoCotizado(cotizacionDetails.getMontoCotizado());
        cotizacion.setCantidadRecurso(cotizacionDetails.getCantidadRecurso());
        return cotizacionRepository.save(cotizacion);
    }

    @DeleteMapping("/{id}")
    public void deleteCotizacion(@PathVariable Long id) {
        cotizacionRepository.deleteById(id);
    }
}