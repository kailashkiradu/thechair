package com.thechair.salons.service;

import com.thechair.salons.dto.SalonResponse;
import com.thechair.salons.entity.Salon;
import com.thechair.salons.entity.SalonStatus;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.users.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SalonServiceGeolocationTest {

    @Mock
    private SalonRepository salonRepository;

    @InjectMocks
    private SalonService salonService;

    private User owner;
    private Salon wimcoNagar;
    private Salon theradi;
    private Salon chennaiCentral;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setName("Owner Name");

        // Wimco Nagar branch: approx 13.1706 N, 80.3015 E
        wimcoNagar = Salon.builder()
                .id(UUID.randomUUID())
                .name("Wimco Nagar Branch")
                .address("Wimco Nagar")
                .city("Chennai")
                .status(SalonStatus.APPROVED)
                .latitude(13.170600)
                .longitude(80.301500)
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .build();

        // Theradi branch: approx 13.1594 N, 80.3014 E
        theradi = Salon.builder()
                .id(UUID.randomUUID())
                .name("Theradi Branch")
                .address("Theradi")
                .city("Chennai")
                .status(SalonStatus.APPROVED)
                .latitude(13.159400)
                .longitude(80.301400)
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .build();

        // Chennai Central default: 13.0827, 80.2707
        chennaiCentral = Salon.builder()
                .id(UUID.randomUUID())
                .name("Central Salon")
                .address("Chennai Central")
                .city("Chennai")
                .status(SalonStatus.APPROVED)
                .latitude(13.082700)
                .longitude(80.270700)
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testGetApprovedSalonsWithoutLocation() {
        when(salonRepository.findByStatus(SalonStatus.APPROVED))
                .thenReturn(Arrays.asList(wimcoNagar, theradi, chennaiCentral));

        List<SalonResponse> results = salonService.getApprovedSalons(null, null, null, null);

        assertEquals(3, results.size());
        assertNull(results.get(0).getDistance());
    }

    @Test
    void testGetApprovedSalonsWithLocationSortAndRadius() {
        when(salonRepository.findByStatus(SalonStatus.APPROVED))
                .thenReturn(Arrays.asList(wimcoNagar, theradi, chennaiCentral));

        // Set our location to Wimco Nagar coordinates: 13.1706, 80.3015
        List<SalonResponse> results = salonService.getApprovedSalons(null, 13.1706, 80.3015, 5.0);

        // Within 5km radius: should only return Wimco Nagar and Theradi
        assertEquals(2, results.size());

        // Should be sorted by distance: Wimco Nagar (0.0 km) first, then Theradi (approx 1.2 km)
        assertEquals("Wimco Nagar Branch", results.get(0).getName());
        assertEquals(0.0, results.get(0).getDistance());

        assertEquals("Theradi Branch", results.get(1).getName());
        assertTrue(results.get(1).getDistance() > 0.5 && results.get(1).getDistance() < 2.0);
    }
}
