package com.incidentnow.repository;

import com.incidentnow.entity.Incident;
import com.incidentnow.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {

        @Query("""
                        SELECT i FROM Incident i
                        WHERE (:status IS NULL OR i.status = :status)
                        AND (:priority IS NULL OR i.priority = :priority)
                        AND (:severity IS NULL OR i.severity = :severity)
                        AND (:category IS NULL OR i.category = :category)
                        AND (:ownerId IS NULL OR i.owner.id = :ownerId)
                        AND (:createdAfter IS NULL OR i.createdAt >= :createdAfter)
                        AND (:createdBefore IS NULL OR i.createdAt <= :createdBefore)
                        AND (:resolvedAfter IS NULL OR i.resolvedAt >= :resolvedAfter)
                        AND (:resolvedBefore IS NULL OR i.resolvedAt <= :resolvedBefore)
                        AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
                             OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))
                        """)
        Page<Incident> findWithFilters(
                        @Param("status") IncidentStatus status,
                        @Param("priority") Priority priority,
                        @Param("severity") Severity severity,
                        @Param("category") IncidentCategory category,
                        @Param("ownerId") UUID ownerId,
                        @Param("createdAfter") LocalDateTime createdAfter,
                        @Param("createdBefore") LocalDateTime createdBefore,
                        @Param("resolvedAfter") LocalDateTime resolvedAfter,
                        @Param("resolvedBefore") LocalDateTime resolvedBefore,
                        @Param("search") String search,
                        Pageable pageable);

        Page<Incident> findByOwnerId(UUID ownerId, Pageable pageable);

        Page<Incident> findByOwnerIdAndStatus(UUID ownerId, IncidentStatus status, Pageable pageable);

        @Query("SELECT i FROM Incident i JOIN i.assignees a WHERE a.id = :assigneeId")
        Page<Incident> findByAssigneeId(@Param("assigneeId") UUID assigneeId, Pageable pageable);

        @Query("SELECT i FROM Incident i JOIN i.assignees a WHERE a.id = :assigneeId AND i.status = :status")
        Page<Incident> findByAssigneeIdAndStatus(@Param("assigneeId") UUID assigneeId,
                        @Param("status") IncidentStatus status, Pageable pageable);

        long countByStatus(IncidentStatus status);

        long countByPriority(Priority priority);

        long countByCategory(IncidentCategory category);

        long countBySlaBreached(boolean slaBreached);

        @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
        List<Object[]> countGroupByStatus();

        @Query("SELECT i.priority, COUNT(i) FROM Incident i GROUP BY i.priority")
        List<Object[]> countGroupByPriority();

        @Query("SELECT i.category, COUNT(i) FROM Incident i GROUP BY i.category")
        List<Object[]> countGroupByCategory();

        @Query("SELECT AVG(i.timeToResolve) FROM Incident i WHERE i.timeToResolve IS NOT NULL")
        Double averageResolutionTime();

        @Query("SELECT AVG(i.timeToAcknowledge) FROM Incident i WHERE i.timeToAcknowledge IS NOT NULL")
        Double averageTimeToAcknowledge();

        @Query("SELECT i.timeToResolve FROM Incident i WHERE i.timeToResolve IS NOT NULL ORDER BY i.timeToResolve")
        List<Integer> findAllResolutionTimes();

        @Query("SELECT i FROM Incident i WHERE i.createdAt >= :from AND i.createdAt <= :toDate")
        List<Incident> findByCreatedAtBetween(@Param("from") LocalDateTime from, @Param("toDate") LocalDateTime toDate);

        @Query("SELECT COUNT(i) FROM Incident i WHERE i.owner.id = :ownerId")
        long countByOwnerId(@Param("ownerId") UUID ownerId);

        @Query("SELECT COUNT(i) FROM Incident i WHERE i.owner.id = :ownerId AND i.status = :status")
        long countByOwnerIdAndStatus(@Param("ownerId") UUID ownerId, @Param("status") IncidentStatus status);

        @Query("SELECT MAX(i.incidentNumber) FROM Incident i")
        String findMaxIncidentNumber();

        @Query("SELECT MAX(i.incidentNumber) FROM Incident i WHERE i.incidentNumber LIKE CONCAT('INC-', :year, '-%')")
        String findMaxIncidentNumberByYear(@Param("year") String year);

        @Query("SELECT COUNT(i) FROM Incident i WHERE i.owner.id = :ownerId AND i.status NOT IN ('CLOSED')")
        long countActiveByOwnerId(@Param("ownerId") UUID ownerId);
}
