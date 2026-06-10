-- V2__favorite_salons.sql
-- Create favorite salons table

CREATE TABLE favorite_salons (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    salon_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_favorites_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_salon FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    CONSTRAINT uq_favorites_customer_salon UNIQUE (customer_id, salon_id)
);
