package com.incidentnow.repository;

import com.incidentnow.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByIncidentIdOrderByCreatedAtDesc(UUID incidentId, Pageable pageable);
}
