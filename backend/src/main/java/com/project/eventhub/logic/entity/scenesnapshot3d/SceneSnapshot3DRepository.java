package com.project.eventhub.logic.entity.scenesnapshot3d;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SceneSnapshot3DRepository extends JpaRepository<SceneSnapshot3D, Long> {
    Page<SceneSnapshot3D> findAll(Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM SceneSnapshot3D ef WHERE ef.scene3D.id = :sceneId")
    void deleteSceneSnapshot3DBy_SceneId(@Param("sceneId") Long sceneId);
}