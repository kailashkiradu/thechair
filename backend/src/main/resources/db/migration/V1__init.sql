-- V1__init.sql
-- Database schema initialization for TheChair

-- 1. Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    no_show_count INTEGER DEFAULT 0 NOT NULL,
    is_restricted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 2. Salons table (Branches)
CREATE TABLE salons (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    category VARCHAR(50),
    image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    rejection_reason VARCHAR(255),
    owner_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_salons_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 3. Salon Offerings (Services)
CREATE TABLE salon_offerings (
    id UUID PRIMARY KEY,
    salon_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    buffer_time INTEGER DEFAULT 0 NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_offerings_salon FOREIGN KEY (salon_id) REFERENCES salons(id)
);

-- 4. Service Packages (Combos)
CREATE TABLE service_packages (
    id UUID PRIMARY KEY,
    salon_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_packages_salon FOREIGN KEY (salon_id) REFERENCES salons(id)
);

-- 5. Service Package Offerings Join Table
CREATE TABLE service_package_offerings (
    package_id UUID NOT NULL,
    offering_id UUID NOT NULL,
    PRIMARY KEY (package_id, offering_id),
    CONSTRAINT fk_spo_package FOREIGN KEY (package_id) REFERENCES service_packages(id),
    CONSTRAINT fk_spo_offering FOREIGN KEY (offering_id) REFERENCES salon_offerings(id)
);

-- 6. Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY,
    salon_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(255),
    photo_url VARCHAR(255),
    experience_years INTEGER,
    average_rating NUMERIC(3,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_staff_salon FOREIGN KEY (salon_id) REFERENCES salons(id)
);

-- 7. Staff Leaves table
CREATE TABLE staff_leaves (
    id UUID PRIMARY KEY,
    staff_id UUID NOT NULL,
    leave_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_leaves_staff FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 8. Salon Exceptions table (Holidays/Emergency Closures)
CREATE TABLE salon_exceptions (
    id UUID PRIMARY KEY,
    salon_id UUID NOT NULL,
    exception_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT TRUE NOT NULL,
    open_time TIME,
    close_time TIME,
    reason VARCHAR(255),
    CONSTRAINT fk_exceptions_salon FOREIGN KEY (salon_id) REFERENCES salons(id)
);

-- 9. Time Slots table (Omit booking_id foreign key constraint first to prevent circular dependency)
CREATE TABLE time_slots (
    id UUID PRIMARY KEY,
    salon_id UUID NOT NULL,
    offering_id UUID NOT NULL,
    staff_id UUID,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE NOT NULL,
    booking_id UUID,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_slots_salon FOREIGN KEY (salon_id) REFERENCES salons(id),
    CONSTRAINT fk_slots_offering FOREIGN KEY (offering_id) REFERENCES salon_offerings(id),
    CONSTRAINT fk_slots_staff FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 10. Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    customer_id UUID,
    salon_id UUID NOT NULL,
    offering_id UUID NOT NULL,
    slot_id UUID NOT NULL UNIQUE,
    staff_id UUID NOT NULL,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    booking_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_salon FOREIGN KEY (salon_id) REFERENCES salons(id),
    CONSTRAINT fk_bookings_offering FOREIGN KEY (offering_id) REFERENCES salon_offerings(id),
    CONSTRAINT fk_bookings_slot FOREIGN KEY (slot_id) REFERENCES time_slots(id),
    CONSTRAINT fk_bookings_staff FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Add booking_id foreign key constraint to time_slots table now that bookings table exists
ALTER TABLE time_slots ADD CONSTRAINT fk_slots_booking FOREIGN KEY (booking_id) REFERENCES bookings(id);

-- 11. Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    salon_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    salon_rating INTEGER NOT NULL,
    staff_rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_salon FOREIGN KEY (salon_id) REFERENCES salons(id),
    CONSTRAINT fk_reviews_staff FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- 12. OTP Verifications table
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    otp_code VARCHAR(20) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- 13. Refresh Tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE NOT NULL,
    replaced_by_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 14. Salon Gallery table
CREATE TABLE salon_gallery (
    id UUID PRIMARY KEY,
    salon_id UUID NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_gallery_salon FOREIGN KEY (salon_id) REFERENCES salons(id)
);

-- 15. Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- 16. Waitlists table
CREATE TABLE waitlists (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    salon_id UUID NOT NULL,
    offering_id UUID NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time_start TIME,
    preferred_time_end TIME,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_waitlists_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_waitlists_salon FOREIGN KEY (salon_id) REFERENCES salons(id),
    CONSTRAINT fk_waitlists_offering FOREIGN KEY (offering_id) REFERENCES salon_offerings(id)
);
