package com.project.eventhub.rest.model;

import com.project.eventhub.logic.entity.models.Model;
import com.project.eventhub.logic.entity.models.ModelRepository;
import com.project.eventhub.logic.http.GlobalResponseHandler;
import com.project.eventhub.logic.http.Meta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/models")
public class ModelRestController {

    @Autowired
    ModelRepository modelRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page, // Número de página, por defecto 0
            @RequestParam(defaultValue = "10") int size, // Tamaño de página, por defecto 10
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page-1, size);
        Page<Model> usersPage = modelRepository.findAll(pageable);

        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(usersPage.getTotalPages());
        meta.setTotalElements(usersPage.getTotalElements());
        meta.setPageNumber(usersPage.getNumber());
        meta.setPageSize(usersPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Users retrieved successfully",
                usersPage.getContent(), // El contenido de la página
                HttpStatus.OK,
                meta
        );
    }

    @GetMapping("files/img/{img_name}")
    public FileSystemResource getImg(@PathVariable("img_name") String img_name) {
        // temporal storage, since this will be stored in a AWS storage, or in a VM.
        return new FileSystemResource(new File("src\\main\\resources\\" + img_name));
    }

    @GetMapping("files/model/{model_name}")
    public FileSystemResource getModelFile(@PathVariable("model_name") String fileName) {
        // temporal storage, since this will be stored in AWS storage, or in a VM.
        return new FileSystemResource(new File("src\\main\\resources\\" + fileName));
    }

    @GetMapping("{id}")
    public Model getModelPath(@PathVariable Long id) {
        return modelRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @GetMapping("files/texture/{texture_name}")
    public FileSystemResource getTextureFile(@PathVariable("texture_name") String fileName) {
        // temporal storage, since this will be stored in AWS storage, or in a VM.
        return new FileSystemResource(new File("src\\main\\resources\\" + fileName));
    }
}