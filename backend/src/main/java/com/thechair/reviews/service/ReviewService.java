package com.thechair.reviews.service;

import com.thechair.bookings.entity.Booking;
import com.thechair.bookings.entity.BookingStatus;
import com.thechair.bookings.repository.BookingRepository;
import com.thechair.reviews.dto.ReviewRequest;
import com.thechair.reviews.dto.ReviewResponse;
import com.thechair.reviews.entity.Review;
import com.thechair.reviews.repository.ReviewRepository;
import com.thechair.staff.entity.Staff;
import com.thechair.staff.repository.StaffRepository;
import com.thechair.users.entity.User;
import com.thechair.users.repository.UserRepository;
import com.thechair.common.exception.BadRequestException;
import com.thechair.common.exception.ConflictException;
import com.thechair.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("You can only review your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("You can only review completed appointments");
        }

        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new ConflictException("You have already reviewed this appointment");
        }

        Review review = Review.builder()
                .booking(booking)
                .customer(customer)
                .salon(booking.getSalon())
                .staff(booking.getStaff())
                .salonRating(request.getSalonRating())
                .staffRating(request.getStaffRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Recalculate Stylist (Staff) Average Rating
        recalculateStaffRating(booking.getStaff().getId());

        return ReviewResponse.from(savedReview);
    }

    public List<ReviewResponse> getSalonReviews(UUID salonId) {
        return reviewRepository.findBySalonId(salonId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    private void recalculateStaffRating(UUID staffId) {
        Staff staff = staffRepository.findById(staffId).orElse(null);
        if (staff == null) return;

        List<Review> reviews = reviewRepository.findByStaffId(staffId);
        if (reviews.isEmpty()) {
            staff.setAverageRating(BigDecimal.ZERO);
        } else {
            double sum = reviews.stream().mapToInt(Review::getStaffRating).sum();
            double avg = sum / reviews.size();
            staff.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        }
        staffRepository.save(staff);
    }
}
