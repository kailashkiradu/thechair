package com.thechair.config;

import com.thechair.entity.User;
import com.thechair.enums.UserRole;
import com.thechair.repository.UserRepository;
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
    }
}
