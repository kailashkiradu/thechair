package com.thechair.auth.repository;

import com.thechair.auth.entity.RefreshToken;
import com.thechair.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUser(User user);
    
    @Modifying
    void deleteByUser(User user);
}
