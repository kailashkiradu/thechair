package com.thechair.auth.service;

import com.thechair.auth.entity.OtpVerification;
import com.thechair.auth.repository.OtpVerificationRepository;
import com.thechair.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateAndSaveOtp(String email) {
        // Delete any existing OTP for this email
        otpRepository.deleteByEmail(email);
        otpRepository.flush(); // Ensure deletion is committed before saving a new one

        // Generate 6-digit OTP
        int number = secureRandom.nextInt(900000) + 100000;
        String otp = String.valueOf(number);

        OtpVerification verification = OtpVerification.builder()
                .email(email)
                .otpCode(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        otpRepository.save(verification);

        // Mock sending of email by logging to console in extreme visual detail
        log.info("\n" +
                "========================================================================\n" +
                "✉️  EMAIL OTP DISPATCH SIMULATOR (THECHAIR SECURITY)\n" +
                "========================================================================\n" +
                "To:      {}\n" +
                "Subject: Verify Your TheChair Account\n" +
                "Body:\n" +
                "    Welcome to TheChair!\n" +
                "    Please use the following 6-digit verification code to complete your signup:\n" +
                "    \n" +
                "    👉  {}  👈\n" +
                "    \n" +
                "    This code is valid for 5 minutes. Do not share it with anyone.\n" +
                "========================================================================", 
                email, otp);

        return otp;
    }

    public boolean verifyOtp(String email, String code) {
        OtpVerification verification = otpRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No verification code found or code expired. Please request a new OTP."));

        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(verification);
            throw new BadRequestException("Verification code has expired. Please request a new OTP.");
        }

        if (!verification.getOtpCode().equals(code)) {
            throw new BadRequestException("Invalid verification code. Please try again.");
        }

        // OTP is correct and not expired: delete it and return success
        otpRepository.delete(verification);
        return true;
    }
}
