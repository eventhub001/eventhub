package com.project.eventhub.logic.entity.scene3d;

import com.project.eventhub.logic.entity.scenesnapshot3d.SceneSnapshot3D;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Scene3DRepository extends JpaRepository<Scene3D, Long> {
    Page<Scene3D> findAll(Pageable pageable);
}
