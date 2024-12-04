package com.project.eventhub.rest.scene3dsetting;

import com.project.eventhub.logic.entity.scene3d.Scene3D;
import com.project.eventhub.logic.entity.scene3d.Scene3DRepository;
import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3D;
import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3DRepository;
import com.project.eventhub.logic.entity.settingoption.SettingOption;
import com.project.eventhub.logic.entity.setting.Setting;
import com.project.eventhub.logic.entity.setting.SettingRepository;
import com.project.eventhub.logic.entity.settingoption.SettingOptionRepository;
import com.project.eventhub.logic.entity.user.User;
import com.project.eventhub.logic.entity.user.UserRepository;
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
@RequestMapping("/settings")
public class SettingRestController {

    @Autowired
    private SettingRepository settingRepository;

    @Autowired
    private SettingOptionRepository settingOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Scene3DRepository scene3DRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllSettings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Setting> settingsPage = settingRepository.findAll(pageable);

        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(settingsPage.getTotalPages());
        meta.setTotalElements(settingsPage.getTotalElements());
        meta.setPageNumber(settingsPage.getNumber() + 1);
        meta.setPageSize(settingsPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Settings retrieved successfully",
                settingsPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }

    @PostMapping
    public ResponseEntity<?> createSetting(@RequestBody Setting setting) {
        Optional<User> user = userRepository.findById(setting.getUser().getId());
        Optional<SettingOption> settingOption = settingOptionRepository.findById(setting.getSettingOption().getId());
        Optional<Scene3D> scene3D = scene3DRepository.findById(setting.getScene3D().getId());
        if (user.isPresent() && settingOption.isPresent() && scene3D.isPresent()) {
            setting.setUser(user.get());
            setting.setSettingOption(settingOption.get());
            setting.setScene3D(scene3D.get());
            Setting savedSetting = settingRepository.save(setting);
            return new ResponseEntity<>(savedSetting, HttpStatus.CREATED);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found or scene not found");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSetting(@PathVariable Long id, @RequestBody Setting setting) {
        return settingRepository.findById(id).map(existingSetting -> {
            Optional<User> user = userRepository.findById(setting.getUser().getId());
            Optional<SettingOption> settingOption = settingOptionRepository.findById(setting.getSettingOption().getId());
            if (user.isPresent() && settingOption.isPresent()) {
                existingSetting.setUser(user.get());
                existingSetting.setSettingOption(settingOption.get());
                Setting updatedSetting = settingRepository.save(existingSetting);
                return new ResponseEntity<>(updatedSetting, HttpStatus.OK);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Setting not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSetting(@PathVariable Long id) {
        if (settingRepository.existsById(id)) {
            settingRepository.deleteById(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Setting not found");
        }
    }
}
