package com.incidentnow.repository;

import com.incidentnow.entity.SupportEngineer;
import com.incidentnow.model.IncidentCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupportEngineerRepository extends JpaRepository<SupportEngineer, UUID> {

    Optional<SupportEngineer> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);

    @Query("""
            SELECT se FROM SupportEngineer se
            WHERE (:active IS NULL OR se.active = :active)
            AND (:search IS NULL OR LOWER(se.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(se.email) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<SupportEngineer> findWithFilters(
            @Param("active") Boolean active,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT se FROM SupportEngineer se JOIN se.categories c WHERE c = :category AND se.active = true")
    List<SupportEngineer> findByCategoryAndActive(@Param("category") IncidentCategory category);
}
