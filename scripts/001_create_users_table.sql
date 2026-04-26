-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  rank INTEGER NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert default user
INSERT INTO users (username, password, full_name, position, rank, avatar)
VALUES (
  'Egor_Washington',
  '123',
  '[Руководство] Egor_Washington',
  '[ТЧ] Начальник Депо',
  9,
  '/avatars/management.png'
)
ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists before creating to avoid errors on re-run
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);
