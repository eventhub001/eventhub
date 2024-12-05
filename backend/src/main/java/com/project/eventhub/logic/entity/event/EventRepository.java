package com.project.eventhub.logic.entity.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Page<Event> findAll(Pageable pageable);
    Page<Event> findAllByUserId(Long userId, Pageable pageable);
    @Query("SELECT e FROM Event e WHERE e.eventName LIKE %:name%")
    Page<Event> findByNameContaining(@Param("name") String name, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.userId = :userId AND e.eventName LIKE %:name%")
    Page<Event> findByUserIdAndNameContaining(@Param("userId") Long userId, @Param("name") String name, Pageable pageable);


    List<Event> findByEventStartDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Event> findByEventStartDate(LocalDateTime date);


}





