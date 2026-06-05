-- ============================================
-- Sistem Perpustakaan — Supabase Schema
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Tabel Kategori
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Buku
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    cover_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Profil (linked ke auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Peminjaman
CREATE TABLE IF NOT EXISTS borrowings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE NOT NULL,
    actual_return_date DATE,
    status TEXT NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Trigger: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Function: Update overdue status
-- ============================================
CREATE OR REPLACE FUNCTION public.update_overdue_status()
RETURNS void AS $$
BEGIN
    UPDATE borrowings
    SET status = 'overdue'
    WHERE status = 'borrowed'
      AND return_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;

-- Categories: semua bisa baca, admin bisa CRUD
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Anyone can read categories"
    ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
CREATE POLICY "Admin can manage categories"
    ON categories FOR ALL USING (
        public.is_admin()
    );

-- Books: semua bisa baca, admin bisa CRUD
DROP POLICY IF EXISTS "Anyone can read books" ON books;
CREATE POLICY "Anyone can read books"
    ON books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage books" ON books;
CREATE POLICY "Admin can manage books"
    ON books FOR ALL USING (
        public.is_admin()
    );

-- Profiles: user baca/edit sendiri, admin baca semua
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Admin can read all profiles"
    ON profiles FOR SELECT USING (
        public.is_admin()
    );

DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
CREATE POLICY "Admin can manage all profiles"
    ON profiles FOR ALL USING (
        public.is_admin()
    );

-- Borrowings: user baca/buat sendiri, admin kelola semua
DROP POLICY IF EXISTS "Users can read own borrowings" ON borrowings;
CREATE POLICY "Users can read own borrowings"
    ON borrowings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own borrowings" ON borrowings;
CREATE POLICY "Users can create own borrowings"
    ON borrowings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all borrowings" ON borrowings;
CREATE POLICY "Admin can manage all borrowings"
    ON borrowings FOR ALL USING (
        public.is_admin()
    );

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_borrowings_user ON borrowings(user_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_return_date ON borrowings(return_date);

-- ============================================
-- Seed Data: Kategori
-- ============================================
INSERT INTO categories (name) VALUES
    ('Fiksi'),
    ('Non-Fiksi'),
    ('Sains'),
    ('Sejarah'),
    ('Teknologi'),
    ('Fantasi'),
    ('Sastra')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Seed Data: Buku (Harry Potter)
-- ============================================
INSERT INTO books (title, author, category_id, stock, cover_url, description) VALUES
    (
        'Harry Potter dan Tawanan Azkaban',
        'J.K. Rowling',
        (SELECT id FROM categories WHERE name = 'Fantasi'),
        5,
        'assets/1.jpg',
        'Harry Potter kembali ke Hogwarts untuk tahun ketiganya. Sirius Black, seorang tahanan berbahaya, melarikan diri dari penjara Azkaban dan diduga mengincar Harry.'
    ),
    (
        'Harry Potter and the Chamber of Secrets',
        'J.K. Rowling',
        (SELECT id FROM categories WHERE name = 'Fantasi'),
        3,
        'assets/2.jpg',
        'Harry kembali ke Hogwarts untuk tahun keduanya, hanya untuk menemukan bahwa Kamar Rahasia telah dibuka dan monster misterius menyerang murid-murid.'
    ),
    (
        'Harry Potter dan Pangeran Berdarah-Campuran',
        'J.K. Rowling',
        (SELECT id FROM categories WHERE name = 'Fantasi'),
        4,
        'assets/3.jpg',
        'Di tahun keenamnya di Hogwarts, Harry menemukan buku teks Ramuan milik Pangeran Berdarah-Campuran yang misterius, sambil Dumbledore mempersiapkannya menghadapi pertempuran terakhir.'
    ),
    (
        'Harry Potter dan Batu Bertuah',
        'J.K. Rowling',
        (SELECT id FROM categories WHERE name = 'Fantasi'),
        6,
        'assets/4.jpg',
        'Harry Potter mengetahui bahwa ia adalah seorang penyihir pada ulang tahunnya yang ke-11 dan memulai petualangannya di Sekolah Sihir Hogwarts.'
    ),
    (
        'Harry Potter dan Relikui Kematian',
        'J.K. Rowling',
        (SELECT id FROM categories WHERE name = 'Fantasi'),
        2,
        'assets/5.jpg',
        'Dalam buku terakhir seri ini, Harry, Ron, dan Hermione meninggalkan Hogwarts untuk mencari dan menghancurkan Horcrux Voldemort.'
    )
ON CONFLICT DO NOTHING;
