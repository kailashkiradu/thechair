package com.thechair.salons.repository;

import com.thechair.salons.entity.FavoriteSalon;
import com.thechair.salons.entity.Salon;
import com.thechair.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteSalonRepository extends JpaRepository<FavoriteSalon, UUID> {
    List<FavoriteSalon> findByCustomer(User customer);
    boolean existsByCustomerAndSalon(User customer, Salon salon);
    Optional<FavoriteSalon> findByCustomerAndSalon(User customer, Salon salon);
}
