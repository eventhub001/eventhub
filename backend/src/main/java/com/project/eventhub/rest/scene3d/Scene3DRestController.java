package com.project.eventhub.rest.scene3d;

import com.project.eventhub.logic.entity.scene3d.Scene3D;
import com.project.eventhub.logic.entity.scene3d.Scene3DRepository;
import com.project.eventhub.logic.entity.setting.Setting;
import com.project.eventhub.logic.entity.setting.SettingRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3D;
import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3DRepository;
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
@RequestMapping("/scene-3d")
public class Scene3DRestController {

    @Autowired
    private Scene3DRepository scene3DRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SettingRepository settingRepository;

    @Autowired
    private SceneSnapshot3DRepository sceneSnapshot3DRepository;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addScene3D(@RequestBody Scene3D scene3D) {
        Optional<User> user = userRepository.findById(scene3D.getUser().getId());

        if (user.isPresent()) {
            scene3D.setUser(user.get());
        }

        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        return ResponseEntity.ok(scene3DRepository.save(scene3D));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllScene3D(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Scene3D> scene3DPage = scene3DRepository.findAll(pageable);

        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(scene3DPage.getTotalPages());
        meta.setTotalElements(scene3DPage.getTotalElements());
        meta.setPageNumber(scene3DPage.getNumber() + 1);
        meta.setPageSize(scene3DPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Scenes retrieved successfully",
                scene3DPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getScene3DById(@PathVariable Long id) {
        Optional<Scene3D> scene3D = scene3DRepository.findById(id);
        if (scene3D.isPresent()) {
            return ResponseEntity.ok(scene3D.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Scene3D with ID " + id + " not found");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateScene3D(@PathVariable Long id, @RequestBody Scene3D scene3D) {
        return scene3DRepository.findById(id)
                .map(existingScene3D -> {
                    Optional.ofNullable(scene3D.getUser()).ifPresent(existingScene3D::setUser);;
                    return ResponseEntity.ok(scene3DRepository.save(existingScene3D));
                })
                .orElseGet(() -> {
                    scene3D.setId(id);
                    return ResponseEntity.ok(scene3DRepository.save(scene3D));
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteScene3D(@PathVariable Long id) {
        if (scene3DRepository.existsById(id)) {
            sceneSnapshot3DRepository.deleteSceneSnapshot3DBy_SceneId(id);
            settingRepository.deleteSettingBy_ScenetId(id);
            scene3DRepository.deleteById(id);
            return ResponseEntity.ok("Scene3D with ID " + id + " deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Scene3D with ID " + id + " not found");
        }
    }
}
