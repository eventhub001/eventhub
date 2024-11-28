package com.project.eventhub.rest.texture;

import com.project.eventhub.logic.entity.textures.Texture;
import com.project.eventhub.logic.entity.textures.TextureRepository;
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
@RequestMapping("/textures")
public class TextureRestController {

    @Autowired
    TextureRepository textureRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getAllTextures(
            @RequestParam(defaultValue = "0") int page, // Número de página, por defecto 0
            @RequestParam(defaultValue = "10") int size, // Tamaño de página, por defecto 10
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Texture> texturesPage = textureRepository.findAll(pageable);

        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(texturesPage.getTotalPages());
        meta.setTotalElements(texturesPage.getTotalElements());
        meta.setPageNumber(texturesPage.getNumber());
        meta.setPageSize(texturesPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Textures retrieved successfully",
                texturesPage.getContent(), // El contenido de la página
                HttpStatus.OK,
                meta
        );
    }


    @GetMapping("files/{texture_name}")
    public FileSystemResource getTextureFile(@PathVariable("texture_name") String fileName) {
        // temporal storage, since this will be stored in AWS storage, or in a VM.
        return new FileSystemResource(new File("src\\main\\resources\\" + fileName));
    }

    @GetMapping("{id}")
    public Texture getTexturePath(@PathVariable Long id) {
        return textureRepository.findById(id).orElseThrow(RuntimeException::new);
    }
}