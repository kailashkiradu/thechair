-- TheChair Relational Database Schema (PostgreSQL)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL, -- CUSTOMER, OWNER, STAFF, ADMIN
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SALONS TABLE
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    category VARCHAR(50) NOT NULL, -- Hair, Spa, Parlour, Unisex, etc.
    image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    rejection_reason VARCHAR(255),
    owner_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. STAFF TABLE
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(255),
    photo_url VARCHAR(255),
    experience_years INTEGER,
    average_rating DECIMAL(3, 2) DEFAULT 0.0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- 4. SALON OFFERINGS TABLE
CREATE TABLE salon_offerings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- 5. TIME SLOTS TABLE
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL,
    staff_id UUID, -- NULL means any staff member
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- 6. BOOKINGS TABLE
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID, -- Nullable for Walk-ins
    salon_id UUID NOT NULL,
    offering_id UUID NOT NULL,
    slot_id UUID NOT NULL UNIQUE,
    staff_id UUID NOT NULL,
    customer_name VARCHAR(100), -- populated for Walk-ins
    customer_phone VARCHAR(20),  -- populated for Walk-ins
    booking_type VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- ONLINE, WALK_IN
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, REFUNDED
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (offering_id) REFERENCES salon_offerings(id) ON DELETE RESTRICT,
    FOREIGN KEY (slot_id) REFERENCES time_slots(id) ON DELETE RESTRICT,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE RESTRICT
);

-- 7. REVIEWS TABLE
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    salon_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    salon_rating INTEGER NOT NULL CHECK (salon_rating BETWEEN 1 AND 5),
    staff_rating INTEGER NOT NULL CHECK (staff_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- 8. OTP VERIFICATIONS TABLE
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    otp_code VARCHAR(10) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. REFRESH TOKENS TABLE
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    replaced_by_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexing for speed optimization
CREATE INDEX idx_salons_city ON salons(city);
CREATE INDEX idx_salons_status ON salons(status);
CREATE INDEX idx_staff_salon_id ON staff(salon_id);
CREATE INDEX idx_salon_offerings_salon_id ON salon_offerings(salon_id);
CREATE INDEX idx_time_slots_lookup ON time_slots(salon_id, date, is_booked);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_salon_id ON bookings(salon_id);
CREATE INDEX idx_reviews_salon_id ON reviews(salon_id);
