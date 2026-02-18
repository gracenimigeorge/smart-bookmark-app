# Smart Bookmark App

A real-time bookmark manager built using Next.js and Supabase.

---

## Live URL
https://smart-bookmark-app-gray-eta.vercel.app/

---

## GitHub Repository
https://github.com/gracenimigeorge/smart-bookmark-app

---

## Features

- Google OAuth Authentication
- Add bookmarks (Title + URL)
- Delete bookmarks
- Bookmarks are private per user
- Real-time updates across tabs
- Deployed on Vercel

---

## Tech Stack

- Next.js (App Router)
- Supabase (Auth + Database + Realtime)
- Tailwind CSS
- Vercel

---

## Database Design

Table: bookmarks

Columns:
- id (uuid)
- user_id (uuid)
- title (text)
- url (text)
- created_at (timestamp)

Row Level Security enabled so users can only see their own bookmarks.

---

## Problems Faced & Solutions

### 1. Git not installed
Git was not installed initially in the system.

**Solution:** Installed Git and configured user name and email.

---

### 2. Git user identity error
Git required user name and email configuration before committing.

**Solution:** Configured using:
```
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

### 3. Google OAuth redirect issue
OAuth needed proper redirect URLs after deployment.

**Solution:** Configured Site URL and Redirect URL in Supabase Authentication settings.

---

### 4. Real-time updates not refreshing
UI was not updating immediately after insert/delete.

**Solution:** Called fetchBookmarks() manually after insert/delete and implemented Supabase Realtime subscription.

---

### 5. 404 error when clicking bookmarks
URLs without https:// were causing navigation errors.

**Solution:** Added logic to automatically prepend https:// if missing.

Solutions were implemented by configuring Git properly, updating Supabase auth settings, and adding frontend validation.

---

## Run Locally

npm install  
npm run dev

---

## Conclusion

This app demonstrates secure authentication, user-level privacy using RLS, and real-time data updates.
