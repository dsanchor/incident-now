package com.incidentnow.repository;

import com.incidentnow.entity.Owner;
import com.incidentnow.model.OwnerRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, UUID> {

    Optional<Owner> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);

    @Query("""
            SELECT o FROM Owner o
            WHERE (:active IS NULL OR o.active = :active)
            AND (:team IS NULL OR o.team = :team)
            AND (:role IS NULL OR o.role = :role)
            AND (:search IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(o.email) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Owner> findWithFilters(
            @Param("active") Boolean active,
            @Param("team") String team,
            @Param("role") OwnerRole role,
            @Param("search") String search,
            Pageable pageable);
}
