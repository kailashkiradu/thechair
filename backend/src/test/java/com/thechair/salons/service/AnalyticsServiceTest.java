package com.thechair.salons.service;

import com.thechair.bookings.entity.Booking;
import com.thechair.bookings.entity.BookingStatus;
import com.thechair.bookings.entity.TimeSlot;
import com.thechair.bookings.entity.Waitlist;
import com.thechair.bookings.repository.BookingRepository;
import com.thechair.bookings.repository.WaitlistRepository;
import com.thechair.salons.dto.*;
import com.thechair.salons.entity.Salon;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.staff.entity.Staff;
import com.thechair.services.entity.SalonOffering;
import com.thechair.users.entity.User;
import com.thechair.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private WaitlistRepository waitlistRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SalonRepository salonRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User owner;
    private Salon salon;
    private Staff stylist;
    private SalonOffering service;
    private List<Booking> mockBookings;
    private LocalDate start;
    private LocalDate end;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setEmail("owner@thechair.com");

        salon = new Salon();
        salon.setId(UUID.randomUUID());
        salon.setOwner(owner);

        stylist = Staff.builder()
                .id(UUID.randomUUID())
                .name("Alice")
                .build();

        service = SalonOffering.builder()
                .id(UUID.randomUUID())
                .name("Haircut")
                .build();

        start = LocalDate.now().minusDays(2);
        end = LocalDate.now();

        TimeSlot slot1 = TimeSlot.builder()
                .date(start)
                .startTime(LocalTime.of(10, 0))
                .build();
        TimeSlot slot2 = TimeSlot.builder()
                .date(end)
                .startTime(LocalTime.of(11, 0))
                .build();

        Booking booking1 = Booking.builder()
                .id(UUID.randomUUID())
                .salon(salon)
                .status(BookingStatus.COMPLETED)
                .totalAmount(BigDecimal.valueOf(1000.00))
                .slot(slot1)
                .staff(stylist)
                .offering(service)
                .customerName("John Doe")
                .customerPhone("9876543210")
                .build();

        Booking booking2 = Booking.builder()
                .id(UUID.randomUUID())
                .salon(salon)
                .status(BookingStatus.CANCELLED)
                .totalAmount(BigDecimal.valueOf(1000.00))
                .slot(slot2)
                .staff(stylist)
                .offering(service)
                .customerName("Jane Doe")
                .customerPhone("1234567890")
                .build();

        mockBookings = Arrays.asList(booking1, booking2);
    }

    @Test
    void testGetSummary() {
        when(userRepository.findByEmail("owner@thechair.com")).thenReturn(Optional.of(owner));
        when(salonRepository.findByOwner(owner)).thenReturn(Optional.of(salon));
        when(bookingRepository.findBySalonAndSlotDateBetween(salon, start, end)).thenReturn(mockBookings);
        when(waitlistRepository.findBySalonIdOrderByCreatedAtDesc(salon.getId())).thenReturn(Collections.emptyList());

        AnalyticsSummaryResponse summary = analyticsService.getSummary("owner@thechair.com", start, end);

        assertEquals(2L, summary.getTotalBookings());
        assertEquals(1L, summary.getCompletedBookings());
        assertEquals(1L, summary.getCancelledBookings());
        assertEquals(0L, summary.getNoShowBookings());
        assertEquals(0, summary.getTotalRevenue().compareTo(BigDecimal.valueOf(1000.00)));
        assertEquals(0, summary.getAverageOrderValue().compareTo(BigDecimal.valueOf(1000.00)));
        assertEquals(0L, summary.getWaitlistCount());
    }

    @Test
    void testGetRevenueTrend() {
        when(userRepository.findByEmail("owner@thechair.com")).thenReturn(Optional.of(owner));
        when(salonRepository.findByOwner(owner)).thenReturn(Optional.of(salon));
        when(bookingRepository.findBySalonAndSlotDateBetween(salon, start, end)).thenReturn(mockBookings);

        List<RevenueTrendItem> trend = analyticsService.getRevenueTrend("owner@thechair.com", start, end);

        // start date is 2 days ago, range is 3 days: start, start+1, start+2
        assertEquals(3, trend.size());
        
        // start day
        assertEquals(start, trend.get(0).getDate());
        assertEquals(0, trend.get(0).getRevenue().compareTo(BigDecimal.valueOf(1000.00)));
        assertEquals(1, trend.get(0).getBookingsCount());

        // middle day (no bookings)
        assertEquals(start.plusDays(1), trend.get(1).getDate());
        assertEquals(0, trend.get(1).getRevenue().compareTo(BigDecimal.ZERO));
        assertEquals(0, trend.get(1).getBookingsCount());

        // end day (today)
        assertEquals(end, trend.get(2).getDate());
        assertEquals(0, trend.get(2).getRevenue().compareTo(BigDecimal.ZERO)); // Cancelled booking
        assertEquals(1, trend.get(2).getBookingsCount());
    }

    @Test
    void testGetStylistPerformance() {
        when(userRepository.findByEmail("owner@thechair.com")).thenReturn(Optional.of(owner));
        when(salonRepository.findByOwner(owner)).thenReturn(Optional.of(salon));
        when(bookingRepository.findBySalonAndSlotDateBetween(salon, start, end)).thenReturn(mockBookings);

        List<StylistPerformanceItem> performance = analyticsService.getStylistPerformance("owner@thechair.com", start, end);

        assertEquals(1, performance.size());
        assertEquals("Alice", performance.get(0).getStaffName());
        assertEquals(2, performance.get(0).getBookingsCount());
        assertEquals(1, performance.get(0).getCompletedCount());
        assertEquals(0, performance.get(0).getTotalRevenue().compareTo(BigDecimal.valueOf(1000.00)));
    }

    @Test
    void testGetServicePopularity() {
        when(userRepository.findByEmail("owner@thechair.com")).thenReturn(Optional.of(owner));
        when(salonRepository.findByOwner(owner)).thenReturn(Optional.of(salon));
        when(bookingRepository.findBySalonAndSlotDateBetween(salon, start, end)).thenReturn(mockBookings);

        List<ServicePopularityItem> popularity = analyticsService.getServicePopularity("owner@thechair.com", start, end);

        assertEquals(1, popularity.size());
        assertEquals("Haircut", popularity.get(0).getServiceName());
        assertEquals(2, popularity.get(0).getBookingsCount());
        assertEquals(0, popularity.get(0).getTotalRevenue().compareTo(BigDecimal.valueOf(1000.00)));
    }

    @Test
    void testExportBookingsCsv() {
        when(userRepository.findByEmail("owner@thechair.com")).thenReturn(Optional.of(owner));
        when(salonRepository.findByOwner(owner)).thenReturn(Optional.of(salon));
        when(bookingRepository.findBySalonAndSlotDateBetween(salon, start, end)).thenReturn(mockBookings);

        String csv = analyticsService.exportBookingsCsv("owner@thechair.com", start, end);

        assertTrue(csv.contains("Booking ID,Date,Time,Customer,Phone,Stylist,Service,Status,Amount"));
        assertTrue(csv.contains("John Doe"));
        assertTrue(csv.contains("Jane Doe"));
        assertTrue(csv.contains("Haircut"));
        assertTrue(csv.contains("Alice"));
    }
}
