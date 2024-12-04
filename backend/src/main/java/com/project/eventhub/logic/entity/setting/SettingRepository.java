package com.project.eventhub.logic.entity.setting;

import com.project.eventhub.logic.entity.setting.Setting;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SettingRepository extends JpaRepository<Setting, Long> {
    Page<Setting> findAll(Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM Setting ef WHERE ef.scene3D.id = :sceneId")
    void deleteSettingBy_ScenetId(@Param("sceneId") Long sceneId);
}