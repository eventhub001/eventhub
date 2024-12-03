package com.project.eventhub.logic.entity.scene3d;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SceneSnapshot3DRepository extends JpaRepository<SceneSnapshot3D, Long> {
    Page<SceneSnapshot3D> findAll(Pageable pageable);
}