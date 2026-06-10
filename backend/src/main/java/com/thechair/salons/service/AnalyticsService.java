package com.thechair.salons.service;

import com.thechair.bookings.entity.Booking;
import com.thechair.bookings.entity.BookingStatus;
import com.thechair.bookings.entity.Waitlist;
import com.thechair.bookings.repository.BookingRepository;
import com.thechair.bookings.repository.WaitlistRepository;
import com.thechair.common.exception.ResourceNotFoundException;
import com.thechair.salons.dto.*;
import com.thechair.salons.entity.Salon;
import com.thechair.salons.repository.SalonRepository;
import com.thechair.staff.entity.Staff;
import com.thechair.services.entity.SalonOffering;
import com.thechair.users.entity.User;
import com.thechair.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final WaitlistRepository waitlistRepository;
    private final UserRepository userRepository;
    private final SalonRepository salonRepository;

    public AnalyticsSummaryResponse getSummary(String ownerEmail, LocalDate startDate, LocalDate endDate) {
        Salon salon = getOwnedSalon(ownerEmail);
        List<Booking> bookings = bookingRepository.findBySalonAndSlotDateBetween(salon, startDate, endDate);

        long total = bookings.size();
        long completed = bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelled = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long noShow = bookings.stream().filter(b -> b.getStatus() == BookingStatus.NO_SHOW).count();

        BigDecimal revenue = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal aov = BigDecimal.ZERO;
        if (completed > 0) {
            aov = revenue.divide(BigDecimal.valueOf(completed), 2, RoundingMode.HALF_UP);
        }

        List<Waitlist> waitlists = waitlistRepository.findBySalonIdOrderByCreatedAtDesc(salon.getId());
        long waitlistCount = waitlists.stream()
                .filter(w -> w.getPreferredDate() != null 
                        && !w.getPreferredDate().isBefore(startDate) 
                        && !w.getPreferredDate().isAfter(endDate))
                .count();

        return AnalyticsSummaryResponse.builder()
                .totalBookings(total)
                .completedBookings(completed)
                .cancelledBookings(cancelled)
                .noShowBookings(noShow)
                .totalRevenue(revenue)
                .averageOrderValue(aov)
                .waitlistCount(waitlistCount)
                .build();
    }

    public List<RevenueTrendItem> getRevenueTrend(String ownerEmail, LocalDate startDate, LocalDate endDate) {
        Salon salon = getOwnedSalon(ownerEmail);
        List<Booking> bookings = bookingRepository.findBySalonAndSlotDateBetween(salon, startDate, endDate);

        Map<LocalDate, List<Booking>> grouped = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getSlot().getDate()));

        List<RevenueTrendItem> trend = new ArrayList<>();
        LocalDate cursor = startDate;

        while (!cursor.isAfter(endDate)) {
            List<Booking> dayBookings = grouped.getOrDefault(cursor, Collections.emptyList());
            BigDecimal dayRevenue = dayBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                    .map(Booking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            trend.add(RevenueTrendItem.builder()
                    .date(cursor)
                    .revenue(dayRevenue)
                    .bookingsCount(dayBookings.size())
                    .build());

            cursor = cursor.plusDays(1);
        }

        return trend;
    }

    public List<StylistPerformanceItem> getStylistPerformance(String ownerEmail, LocalDate startDate, LocalDate endDate) {
        Salon salon = getOwnedSalon(ownerEmail);
        List<Booking> bookings = bookingRepository.findBySalonAndSlotDateBetween(salon, startDate, endDate);

        Map<Staff, List<Booking>> grouped = bookings.stream()
                .filter(b -> b.getStaff() != null)
                .collect(Collectors.groupingBy(Booking::getStaff));

        List<StylistPerformanceItem> items = new ArrayList<>();

        for (Map.Entry<Staff, List<Booking>> entry : grouped.entrySet()) {
            Staff stylist = entry.getKey();
            List<Booking> stylistBookings = entry.getValue();

            int total = stylistBookings.size();
            int completed = (int) stylistBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
            BigDecimal revenue = stylistBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                    .map(Booking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            items.add(StylistPerformanceItem.builder()
                    .staffId(stylist.getId())
                    .staffName(stylist.getName())
                    .bookingsCount(total)
                    .completedCount(completed)
                    .totalRevenue(revenue)
                    .build());
        }

        items.sort((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()));
        return items;
    }

    public List<ServicePopularityItem> getServicePopularity(String ownerEmail, LocalDate startDate, LocalDate endDate) {
        Salon salon = getOwnedSalon(ownerEmail);
        List<Booking> bookings = bookingRepository.findBySalonAndSlotDateBetween(salon, startDate, endDate);

        Map<SalonOffering, List<Booking>> grouped = bookings.stream()
                .filter(b -> b.getOffering() != null)
                .collect(Collectors.groupingBy(Booking::getOffering));

        List<ServicePopularityItem> items = new ArrayList<>();

        for (Map.Entry<SalonOffering, List<Booking>> entry : grouped.entrySet()) {
            SalonOffering service = entry.getKey();
            List<Booking> serviceBookings = entry.getValue();

            int total = serviceBookings.size();
            BigDecimal revenue = serviceBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                    .map(Booking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            items.add(ServicePopularityItem.builder()
                    .serviceId(service.getId())
                    .serviceName(service.getName())
                    .bookingsCount(total)
                    .totalRevenue(revenue)
                    .build());
        }

        items.sort((a, b) -> b.getBookingsCount().compareTo(a.getBookingsCount()));
        return items;
    }

    public String exportBookingsCsv(String ownerEmail, LocalDate startDate, LocalDate endDate) {
        Salon salon = getOwnedSalon(ownerEmail);
        List<Booking> bookings = bookingRepository.findBySalonAndSlotDateBetween(salon, startDate, endDate);

        StringBuilder csv = new StringBuilder();
        // CSV Headers
        csv.append("Booking ID,Date,Time,Customer,Phone,Stylist,Service,Status,Amount\n");

        for (Booking b : bookings) {
            csv.append(escapeCsvField(b.getId().toString())).append(",")
               .append(escapeCsvField(b.getSlot().getDate().toString())).append(",")
               .append(escapeCsvField(b.getSlot().getStartTime().toString())).append(",")
               .append(escapeCsvField(b.getCustomerName())).append(",")
               .append(escapeCsvField(b.getCustomerPhone())).append(",")
               .append(escapeCsvField(b.getStaff() != null ? b.getStaff().getName() : "Any")).append(",")
               .append(escapeCsvField(b.getOffering().getName())).append(",")
               .append(escapeCsvField(b.getStatus().toString())).append(",")
               .append(b.getTotalAmount().toString()).append("\n");
        }

        return csv.toString();
    }

    private String escapeCsvField(String field) {
        if (field == null) return "";
        String val = field.replace("\"", "\"\"");
        if (val.contains(",") || val.contains("\n") || val.contains("\"")) {
            return "\"" + val + "\"";
        }
        return val;
    }

    private User getOwner(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
    }

    private Salon getOwnedSalon(String ownerEmail) {
        User owner = getOwner(ownerEmail);
        return salonRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("No salon registered yet"));
    }
}
