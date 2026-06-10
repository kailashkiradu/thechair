package com.thechair.common.config;

import com.thechair.salons.entity.SalonStatus;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.users.entity.User;
import com.thechair.users.entity.UserRole;
import com.thechair.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SalonRepository salonRepository;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@thechair.com")) {
            User admin = User.builder()
                    .name("TheChair Admin")
                    .email("admin@thechair.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("9999999999")
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default admin created: admin@thechair.com / admin123");
        }

        // Auto-approve any existing pending salons for easy local testing
        salonRepository.findByStatus(SalonStatus.PENDING).forEach(salon -> {
            salon.setStatus(SalonStatus.APPROVED);
            salonRepository.save(salon);
            log.info("Auto-approved existing pending salon on startup: {}", salon.getName());
        });
    }
}
