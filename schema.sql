
-- Tabela de Roupas (Inventory)
CREATE TABLE IF NOT EXISTS clothes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    size TEXT NOT NULL,
    measurements JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'disponivel',
    rental_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deposit_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    rent_count INTEGER DEFAULT 0,
    history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document TEXT UNIQUE NOT NULL,
    phone TEXT,
    email TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clothe_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'orcamento',
    total_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deposit_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'pendente',
    payment_method TEXT DEFAULT 'vista',
    discount_percent NUMERIC(10, 2) DEFAULT 0,
    return_checklist JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reservations_clothe_id ON reservations(clothe_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_clothes_status ON clothes(status);
