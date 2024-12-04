package com.project.eventhub.logic.entity.settingoption;

import com.project.eventhub.logic.entity.settingoption.SettingOption;
import com.project.eventhub.logic.entity.setting.Setting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingOptionRepository extends JpaRepository<SettingOption, Long> {
    Page<SettingOption> findAll(Pageable pageable);
}