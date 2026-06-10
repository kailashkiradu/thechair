package com.thechair.salons.repository;

import com.thechair.salons.entity.Salon;
import com.thechair.users.entity.User;
import com.thechair.salons.entity.SalonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalonRepository extends JpaRepository<Salon, UUID> {
    List<Salon> findByStatus(SalonStatus status);
    Optional<Salon> findByOwner(User owner);
    boolean existsByOwner(User owner);

    @Query("SELECT s FROM Salon s WHERE s.status = 'APPROVED' AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Salon> searchApproved(@Param("query") String query);

    long countByStatus(SalonStatus status);
}
