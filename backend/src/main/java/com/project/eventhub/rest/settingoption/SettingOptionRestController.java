package com.project.eventhub.rest.settingoption;

import com.project.eventhub.logic.entity.settingoption.SettingOption;
import com.project.eventhub.logic.entity.settingoption.SettingOptionRepository;
import com.project.eventhub.logic.http.GlobalResponseHandler;
import com.project.eventhub.logic.http.Meta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/setting-options")
public class SettingOptionRestController {

    @Autowired
    private SettingOptionRepository settingOptionRepository;

    @GetMapping
    public ResponseEntity<?> getAllSettingOptions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SettingOption> settingOptionsPage = settingOptionRepository.findAll(pageable);

        Meta meta = new Meta(request.getMethod(), request.getRequestURL().toString());
        meta.setTotalPages(settingOptionsPage.getTotalPages());
        meta.setTotalElements(settingOptionsPage.getTotalElements());
        meta.setPageNumber(settingOptionsPage.getNumber() + 1);
        meta.setPageSize(settingOptionsPage.getSize());

        return new GlobalResponseHandler().handleResponse(
                "Setting options retrieved successfully",
                settingOptionsPage.getContent(),
                HttpStatus.OK,
                meta
        );
    }

    @PostMapping
    public ResponseEntity<?> createSettingOption(@RequestBody SettingOption settingOption) {
        SettingOption savedSettingOption = settingOptionRepository.save(settingOption);
        return new ResponseEntity<>(savedSettingOption, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSettingOption(@PathVariable Long id) {
        if (settingOptionRepository.existsById(id)) {
            settingOptionRepository.deleteById(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Setting option not found");
        }
    }
}
