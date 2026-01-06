-- Location: supabase/migrations/20260106074722_supply_chain_realtime.sql
-- Schema Analysis: Existing car rental schema (vehicles, reservations, user_profiles)
-- Integration Type: NEW_MODULE - Supply chain management system
-- Dependencies: user_profiles (for authentication relationship)

-- ============================================
-- 1. TYPES - Supply Chain Domain
-- ============================================

CREATE TYPE public.shipment_status AS ENUM ('pending', 'in-transit', 'delayed', 'delivered');
CREATE TYPE public.shipment_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.port_status AS ENUM ('operational', 'congested', 'maintenance', 'closed');
CREATE TYPE public.tracking_event_type AS ENUM ('departure', 'arrival', 'customs_clearance', 'delay', 'delivery');

-- ============================================
-- 2. CORE TABLES
-- ============================================

-- Ports/Terminals
CREATE TABLE public.ports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    port_code TEXT NOT NULL UNIQUE,
    port_name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    capacity INTEGER NOT NULL DEFAULT 0,
    current_utilization INTEGER NOT NULL DEFAULT 0,
    port_status public.port_status DEFAULT 'operational'::public.port_status,
    average_processing_time_hours NUMERIC(5, 2) DEFAULT 24.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Shipments
CREATE TABLE public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT NOT NULL UNIQUE,
    origin_port_id UUID REFERENCES public.ports(id) ON DELETE SET NULL,
    destination_port_id UUID REFERENCES public.ports(id) ON DELETE SET NULL,
    carrier TEXT NOT NULL,
    items_count INTEGER NOT NULL DEFAULT 0,
    estimated_arrival TIMESTAMPTZ NOT NULL,
    actual_arrival TIMESTAMPTZ,
    shipment_status public.shipment_status DEFAULT 'pending'::public.shipment_status,
    shipment_priority public.shipment_priority DEFAULT 'medium'::public.shipment_priority,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_location_update TIMESTAMPTZ,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tracking Events
CREATE TABLE public.tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    event_type public.tracking_event_type NOT NULL,
    event_description TEXT NOT NULL,
    event_location TEXT,
    event_latitude NUMERIC(10, 7),
    event_longitude NUMERIC(10, 7),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Port Metrics (Real-time analytics)
CREATE TABLE public.port_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    port_id UUID REFERENCES public.ports(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    vessels_arrived INTEGER DEFAULT 0,
    vessels_departed INTEGER DEFAULT 0,
    average_wait_time_hours NUMERIC(5, 2) DEFAULT 0,
    throughput_teu INTEGER DEFAULT 0,
    congestion_level INTEGER DEFAULT 0 CHECK (congestion_level >= 0 AND congestion_level <= 100),
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(port_id, metric_date)
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX idx_ports_port_code ON public.ports(port_code);
CREATE INDEX idx_ports_status ON public.ports(port_status);
CREATE INDEX idx_shipments_shipment_id ON public.shipments(shipment_id);
CREATE INDEX idx_shipments_status ON public.shipments(shipment_status);
CREATE INDEX idx_shipments_priority ON public.shipments(shipment_priority);
CREATE INDEX idx_shipments_eta ON public.shipments(estimated_arrival);
CREATE INDEX idx_shipments_origin ON public.shipments(origin_port_id);
CREATE INDEX idx_shipments_destination ON public.shipments(destination_port_id);
CREATE INDEX idx_shipments_created_by ON public.shipments(created_by);
CREATE INDEX idx_tracking_events_shipment ON public.tracking_events(shipment_id);
CREATE INDEX idx_tracking_events_timestamp ON public.tracking_events(event_timestamp);
CREATE INDEX idx_port_metrics_port_date ON public.port_metrics(port_id, metric_date);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_supply_chain_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Calculate port utilization
CREATE OR REPLACE FUNCTION public.update_port_utilization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.ports
    SET current_utilization = (
        SELECT COUNT(*)
        FROM public.shipments
        WHERE (origin_port_id = NEW.id OR destination_port_id = NEW.id)
        AND shipment_status IN ('pending', 'in-transit')
    )
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access for ports and port metrics
CREATE POLICY "public_read_ports"
ON public.ports
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_read_port_metrics"
ON public.port_metrics
FOR SELECT
TO public
USING (true);

-- Authenticated users can manage shipments
CREATE POLICY "authenticated_read_shipments"
ON public.shipments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_create_shipments"
ON public.shipments
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid()::uuid);

CREATE POLICY "authenticated_update_own_shipments"
ON public.shipments
FOR UPDATE
TO authenticated
USING (created_by = auth.uid()::uuid)
WITH CHECK (created_by = auth.uid()::uuid);

-- Tracking events follow shipment permissions
CREATE POLICY "authenticated_read_tracking_events"
ON public.tracking_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.shipments s
        WHERE s.id = shipment_id
    )
);

CREATE POLICY "authenticated_create_tracking_events"
ON public.tracking_events
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.shipments s
        WHERE s.id = shipment_id
        AND s.created_by = auth.uid()::uuid
    )
);

-- ============================================
-- 6. TRIGGERS
-- ============================================

CREATE TRIGGER trigger_update_ports_updated_at
BEFORE UPDATE ON public.ports
FOR EACH ROW
EXECUTE FUNCTION public.update_supply_chain_updated_at();

CREATE TRIGGER trigger_update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.update_supply_chain_updated_at();

-- ============================================
-- 7. MOCK DATA
-- ============================================

DO $$
DECLARE
    user_id UUID;
    port_la UUID := gen_random_uuid();
    port_ny UUID := gen_random_uuid();
    port_seattle UUID := gen_random_uuid();
    port_miami UUID := gen_random_uuid();
    port_chicago UUID := gen_random_uuid();
    shipment1_id UUID := gen_random_uuid();
    shipment2_id UUID := gen_random_uuid();
    shipment3_id UUID := gen_random_uuid();
    shipment4_id UUID := gen_random_uuid();
    shipment5_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user
    SELECT id INTO user_id FROM public.user_profiles LIMIT 1;
    
    -- Insert ports
    INSERT INTO public.ports (id, port_code, port_name, country, city, latitude, longitude, capacity, current_utilization, port_status) VALUES
        (port_la, 'USLAX', 'Port of Los Angeles', 'United States', 'Los Angeles', 33.7428, -118.2720, 10000, 7500, 'operational'),
        (port_ny, 'USNYC', 'Port of New York', 'United States', 'New York', 40.6831, -74.0776, 8000, 6200, 'operational'),
        (port_seattle, 'USSEA', 'Port of Seattle', 'United States', 'Seattle', 47.6062, -122.3321, 6000, 4800, 'congested'),
        (port_miami, 'USMIA', 'Port of Miami', 'United States', 'Miami', 25.7743, -80.1864, 5000, 3500, 'operational'),
        (port_chicago, 'USCHI', 'Port of Chicago', 'United States', 'Chicago', 41.8781, -87.6298, 4000, 2000, 'maintenance');

    -- Insert shipments
    INSERT INTO public.shipments (
        id, shipment_id, origin_port_id, destination_port_id, carrier, items_count,
        estimated_arrival, shipment_status, shipment_priority, progress_percentage,
        last_location_update, current_latitude, current_longitude, created_by
    ) VALUES
        (shipment1_id, 'SH-2024-001', port_la, port_ny, 'FedEx Ground', 245,
         CURRENT_TIMESTAMP + INTERVAL '2 days', 'in-transit', 'high', 75,
         CURRENT_TIMESTAMP - INTERVAL '1 hour', 36.7783, -119.4179, user_id),
        (shipment2_id, 'SH-2024-002', port_seattle, port_miami, 'UPS Express', 156,
         CURRENT_TIMESTAMP + INTERVAL '3 days', 'delayed', 'critical', 45,
         CURRENT_TIMESTAMP - INTERVAL '2 hours', 39.8283, -98.5795, user_id),
        (shipment3_id, 'SH-2024-003', port_chicago, port_la, 'DHL Express', 89,
         CURRENT_TIMESTAMP - INTERVAL '1 day', 'delivered', 'medium', 100,
         CURRENT_TIMESTAMP - INTERVAL '1 day', 34.0522, -118.2437, user_id),
        (shipment4_id, 'SH-2024-004', port_miami, port_seattle, 'USPS Priority', 312,
         CURRENT_TIMESTAMP + INTERVAL '4 days', 'pending', 'low', 15,
         CURRENT_TIMESTAMP - INTERVAL '3 hours', 29.7604, -95.3698, user_id),
        (shipment5_id, 'SH-2024-005', port_ny, port_miami, 'FedEx Express', 198,
         CURRENT_TIMESTAMP + INTERVAL '2 days', 'in-transit', 'high', 60,
         CURRENT_TIMESTAMP - INTERVAL '30 minutes', 38.8951, -77.0369, user_id);

    -- Insert tracking events
    INSERT INTO public.tracking_events (shipment_id, event_type, event_description, event_location, event_timestamp) VALUES
        (shipment1_id, 'departure', 'Shipment departed from Port of Los Angeles', 'Los Angeles, CA', CURRENT_TIMESTAMP - INTERVAL '2 days'),
        (shipment1_id, 'customs_clearance', 'Customs clearance completed', 'Phoenix, AZ', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (shipment2_id, 'departure', 'Shipment departed from Port of Seattle', 'Seattle, WA', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        (shipment2_id, 'delay', 'Weather delay - Expected 6 hour delay', 'Denver, CO', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (shipment3_id, 'departure', 'Shipment departed from Port of Chicago', 'Chicago, IL', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        (shipment3_id, 'arrival', 'Arrived at destination port', 'Los Angeles, CA', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (shipment3_id, 'delivery', 'Shipment delivered successfully', 'Los Angeles, CA', CURRENT_TIMESTAMP - INTERVAL '1 day');

    -- Insert port metrics
    INSERT INTO public.port_metrics (port_id, metric_date, vessels_arrived, vessels_departed, average_wait_time_hours, throughput_teu, congestion_level) VALUES
        (port_la, CURRENT_DATE, 45, 42, 4.5, 8500, 75),
        (port_ny, CURRENT_DATE, 38, 35, 5.2, 6800, 62),
        (port_seattle, CURRENT_DATE, 32, 28, 6.8, 5200, 85),
        (port_miami, CURRENT_DATE, 28, 30, 3.8, 4200, 55),
        (port_chicago, CURRENT_DATE, 15, 18, 8.5, 2500, 40);
END $$;