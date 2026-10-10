-- ==============================================================================
-- FINORA - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Migration: 20261010_initial_schema.sql
-- Description: Core tables, RLS policies, trigger profiles, and seed categories
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: PROFILES (Terkoneksi dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    currency VARCHAR(10) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: ACCOUNTS (Sumber dana: Tunai, Rekening Bank, E-Wallet)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL DEFAULT 'bank', -- 'cash', 'bank', 'ewallet'
    opening_balance NUMERIC(14,2) DEFAULT 0,
    current_balance NUMERIC(14,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: CATEGORIES (Kategori pemasukan & pengeluaran)
-- user_id NULL menandakan kategori bawaan sistem (global), sedangkan jika ada isinya berarti kategori kustom pengguna
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: TRANSACTIONS (Pencatatan mutasi keuangan)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    description TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method VARCHAR(50) DEFAULT 'Transfer',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE: BUDGETS (Batas pengeluaran per kategori)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    amount_limit NUMERIC(14,2) NOT NULL CHECK (amount_limit > 0),
    period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE: SAVINGS_GOALS (Target tabungan masa depan)
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    icon VARCHAR(50),
    color VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXING UNTUK PERFORMA QUERY CEPAT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON public.transactions(occurred_at);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - ISOLASI DATA PENGGUNA TOTAL
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- 2. Accounts Policies
CREATE POLICY "Users can manage own accounts"
    ON public.accounts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Categories Policies (Bisa lihat default sistem atau buatan sendiri)
CREATE POLICY "Users can view default or own categories"
    ON public.categories FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Transactions Policies
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        (account_id IS NULL OR EXISTS (SELECT 1 FROM public.accounts WHERE id = account_id AND user_id = auth.uid())) AND
        (category_id IS NULL OR EXISTS (SELECT 1 FROM public.categories WHERE id = category_id AND (user_id IS NULL OR user_id = auth.uid())))
    );

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Budgets Policies
CREATE POLICY "Users can manage own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Savings Goals Policies
CREATE POLICY "Users can manage own savings goals"
    ON public.savings_goals FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER OTOMATIS SAAT USER REGISTRASI (AUTH.USERS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Buat profil pengguna otomatis
    INSERT INTO public.profiles (id, full_name, avatar_url, currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
        'IDR'
    );

    -- 2. Buat dompet utama default (Tunai / Rekening Utama)
    INSERT INTO public.accounts (user_id, name, account_type, opening_balance, current_balance)
    VALUES (NEW.id, 'Dompet Utama', 'cash', 0, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- SEED KATEGORI BAWAAN SISTEM (user_id = NULL)
-- ==============================================================================
INSERT INTO public.categories (user_id, name, type, icon, color)
VALUES
    -- Pengeluaran
    (NULL, 'Makanan', 'expense', 'Utensils', '#F59E0B'),
    (NULL, 'Transportasi', 'expense', 'Car', '#3B82F6'),
    (NULL, 'Belanja', 'expense', 'ShoppingBag', '#8B5CF6'),
    (NULL, 'Tagihan', 'expense', 'Receipt', '#F97316'),
    (NULL, 'Hiburan', 'expense', 'Film', '#EC4899'),
    (NULL, 'Pendidikan', 'expense', 'GraduationCap', '#10B981'),
    (NULL, 'Kesehatan', 'expense', 'HeartPulse', '#EF4444'),
    (NULL, 'Lainnya', 'expense', 'MoreHorizontal', '#64748B'),
    -- Pemasukan
    (NULL, 'Gaji', 'income', 'Briefcase', '#10B981'),
    (NULL, 'Freelance', 'income', 'Laptop', '#06B6D4'),
    (NULL, 'Investasi', 'income', 'TrendingUp', '#6366F1'),
    (NULL, 'Hadiah', 'income', 'Gift', '#F43F5E'),
    (NULL, 'Lainnya', 'income', 'PlusCircle', '#64748B')
ON CONFLICT DO NOTHING;
