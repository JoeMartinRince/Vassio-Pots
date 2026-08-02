-- ==============================================================================
-- VASSIO ADMIN DASHBOARD & PRODUCT DATABASE SCHEMA FOR SUPABASE
-- ==============================================================================

-- 1. PRODUCTS TABLE (Dynamic Business Data ONLY)
-- Note: Static details (images, gallery, descriptions, specs, dimensions, materials) 
-- remain in frontend static assets (src/data/products.ts & public/products/)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL UNIQUE, -- Unique product code/slug connecting to static frontend data
    price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2),
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'pre_order')),
    featured BOOLEAN DEFAULT false,
    new_arrival BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by product_id
CREATE INDEX IF NOT EXISTS idx_products_product_id ON public.products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(active, featured);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    items JSONB NOT NULL, -- Array of ordered items [{ product_id, name, price, quantity, size, image }]
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    shipping_status TEXT DEFAULT 'unshipped' CHECK (shipping_status IN ('unshipped', 'shipped', 'delivered')),
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    total_orders INT DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    last_order_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 4. ADMIN USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- PRODUCTS POLICIES
-- Anyone can read active products
CREATE POLICY "Public read active products" 
    ON public.products FOR SELECT 
    USING (active = true OR auth.role() = 'authenticated');

-- Authenticated Admin/Staff can insert, update, delete
CREATE POLICY "Authenticated users write products" 
    ON public.products FOR ALL 
    USING (auth.role() = 'authenticated');

-- ORDERS POLICIES
-- Anyone can create an order (during checkout)
CREATE POLICY "Public insert orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

-- Authenticated Admin/Staff can manage all orders
CREATE POLICY "Authenticated users manage orders" 
    ON public.orders FOR ALL 
    USING (auth.role() = 'authenticated');

-- CUSTOMERS POLICIES
-- Authenticated users manage customers
CREATE POLICY "Authenticated users manage customers" 
    ON public.customers FOR ALL 
    USING (auth.role() = 'authenticated');

-- ADMIN USERS POLICIES
CREATE POLICY "Authenticated users read admin_users" 
    ON public.admin_users FOR SELECT 
    USING (auth.role() = 'authenticated');

-- ==============================================================================
-- SEED INITIAL DYNAMIC PRODUCT DATA
-- ==============================================================================

INSERT INTO public.products (product_id, price, mrp, discount_percentage, stock_status, featured, new_arrival, display_order, active)
VALUES 
    ('FLX48', 5200.00, 7500.00, 30.0, 'in_stock', true, true, 1, true),
    ('LFS70', 4500.00, 6500.00, 30.0, 'in_stock', true, false, 2, true),
    ('LFS69', 4500.00, 6500.00, 30.0, 'in_stock', false, true, 3, true),
    ('VNL83', 3000.00, 4500.00, 33.0, 'in_stock', true, true, 4, true),
    ('ARC84', 5500.00, 8000.00, 31.0, 'in_stock', true, false, 5, true),
    ('FFT2399', 14999.00, 23999.00, 37.0, 'in_stock', false, false, 6, true)
ON CONFLICT (product_id) DO UPDATE SET 
    price = EXCLUDED.price,
    mrp = EXCLUDED.mrp,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_status = EXCLUDED.stock_status,
    featured = EXCLUDED.featured,
    new_arrival = EXCLUDED.new_arrival;

-- ==============================================================================
-- SEED INITIAL SAMPLE ORDERS FOR REVENUE DASHBOARD
-- ==============================================================================

INSERT INTO public.orders (order_number, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, discount_amount, total_amount, order_status, payment_status, shipping_status, tracking_number, created_at)
VALUES 
    (
        'VAS-1001', 
        'Ananya Sharma', 
        'ananya.sharma@example.com', 
        '+91 98765 43210', 
        '42 Lotus Boulevard, Bandra West, Mumbai 400050',
        '[{"product_id": "FLX48", "name": "Flax Series Tapered Vases", "price": 5200, "quantity": 1, "size": "Flax-D (H: 21\")"}]',
        5200.00, 
        260.00, 
        4940.00, 
        'completed', 
        'paid', 
        'delivered', 
        'BLRD-9988231',
        NOW() - INTERVAL '2 days'
    ),
    (
        'VAS-1002', 
        'Vikramaditya Roy', 
        'vikram.roy@example.com', 
        '+91 98123 88765', 
        '88 Park Street, 4th Floor, Kolkata 700016',
        '[{"product_id": "ARC84", "name": "Areca Ribbed Planters - Set of 3", "price": 5500, "quantity": 1, "size": "Set of 3"}]',
        5500.00, 
        0.00, 
        5500.00, 
        'processing', 
        'paid', 
        'shipped', 
        'BLRD-9988450',
        NOW() - INTERVAL '1 day'
    ),
    (
        'VAS-1003', 
        'Priya Nair', 
        'priya.nair@example.com', 
        '+91 97455 11223', 
        '15 Indiranagar 100ft Road, Bengaluru 560038',
        '[{"product_id": "VNL83", "name": "VANILLA Planters - Set of 3", "price": 3000, "quantity": 2, "size": "Set of 3"}]',
        6000.00, 
        300.00, 
        5700.00, 
        'pending', 
        'pending', 
        'unshipped', 
        NULL,
        NOW() - INTERVAL '3 hours'
    ),
    (
        'VAS-1004', 
        'Rohan Mehta', 
        'rohan.mehta@example.com', 
        '+91 99001 22334', 
        '702 DLF Phase 5, Gurugram 122002',
        '[{"product_id": "FFT2399", "name": "Faux Ficus Tree — 6 Feet", "price": 14999, "quantity": 1, "size": "6 Feet"}]',
        14999.00, 
        750.00, 
        14249.00, 
        'completed', 
        'paid', 
        'delivered', 
        'BLRD-9987110',
        NOW() - INTERVAL '5 days'
    )
ON CONFLICT (order_number) DO NOTHING;

-- SEED CUSTOMERS SUMMARY
INSERT INTO public.customers (name, email, phone, total_orders, total_spent, last_order_at)
VALUES 
    ('Ananya Sharma', 'ananya.sharma@example.com', '+91 98765 43210', 1, 4940.00, NOW() - INTERVAL '2 days'),
    ('Vikramaditya Roy', 'vikram.roy@example.com', '+91 98123 88765', 1, 5500.00, NOW() - INTERVAL '1 day'),
    ('Priya Nair', 'priya.nair@example.com', '+91 97455 11223', 1, 5700.00, NOW() - INTERVAL '3 hours'),
    ('Rohan Mehta', 'rohan.mehta@example.com', '+91 99001 22334', 1, 14249.00, NOW() - INTERVAL '5 days')
ON CONFLICT (email) DO NOTHING;
