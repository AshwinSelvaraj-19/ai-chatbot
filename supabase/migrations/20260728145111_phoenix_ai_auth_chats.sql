/*
# Phoenix AI - Auth, Profiles, Chats & Messages

## Overview
Adds user accounts (email/password) and per-user chat storage to Phoenix AI.
Replaces the previous localStorage-only persistence with Supabase.

## New Tables

### 1. `profiles`
- `id` (uuid, primary key) — matches `auth.users.id`
- `email` (text, not null) — copied from the auth user's email
- `created_at` (timestamptz, default now())
- One row per signed-up user. Scoped to the owner via RLS.

### 2. `chats`
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, not null, default auth.uid()) — owner of the chat
- `title` (text, not null, default 'New chat')
- `created_at` (timestamptz, default now())
- Foreign key `user_id` -> `auth.users(id)` ON DELETE CASCADE
- Scoped to the owner via RLS.

### 3. `messages`
- `id` (uuid, primary key, default gen_random_uuid())
- `chat_id` (uuid, not null) — the chat this message belongs to
- `role` (text, not null) — 'user' or 'assistant'
- `content` (text, not null, default '')
- `created_at` (timestamptz, default now())
- Foreign key `chat_id` -> `chats(id)` ON DELETE CASCADE
- Scoped to the chat owner via RLS (ownership checked through the parent `chats` table).

## Security (Row Level Security)

All three tables have RLS enabled with owner-scoped policies:

### profiles
- SELECT: authenticated users can read their own profile (`auth.uid() = id`)
- INSERT: authenticated users can insert their own profile (`auth.uid() = id`)
- UPDATE: authenticated users can update their own profile
- DELETE: authenticated users can delete their own profile

### chats
- SELECT: owner only (`auth.uid() = user_id`)
- INSERT: owner only (`auth.uid() = user_id`) — `user_id` defaults to `auth.uid()`
- UPDATE: owner only
- DELETE: owner only

### messages
- SELECT: only if the parent chat belongs to the authenticated user
- INSERT: only if the parent chat belongs to the authenticated user
- UPDATE: only if the parent chat belongs to the authenticated user
- DELETE: only if the parent chat belongs to the authenticated user

## Important Notes
1. Email confirmation stays OFF (per project defaults). Users can sign in immediately after signup.
2. `chats.user_id` has `DEFAULT auth.uid()` so frontend inserts omitting `user_id` succeed.
3. Deleting a chat cascades to its messages (FK ON DELETE CASCADE).
4. No OAuth, no password reset, no email verification — simple email/password only.
*/

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New chat',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chats" ON chats;
CREATE POLICY "select_own_chats" ON chats FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chats" ON chats;
CREATE POLICY "insert_own_chats" ON chats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chats" ON chats;
CREATE POLICY "update_own_chats" ON chats FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chats" ON chats;
CREATE POLICY "delete_own_chats" ON chats FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
