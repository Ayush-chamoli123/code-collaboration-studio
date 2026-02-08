

# CodeSphere — Collaborative C++ Code Editor

## Overview
A real-time collaborative code editor focused on C++ with room-based collaboration (like Google Meet), a working C++ compiler, real-time chat, whiteboard, and contributor tracking.

---

## 1. Authentication & User Accounts
- Full email/password sign up and login using Supabase Auth
- User profile with display name and avatar
- Redirect unauthenticated users to the auth page

## 2. Landing / Home Page
- Dark-themed landing page (matching the screenshots)
- Feature cards: Code Editor, Whiteboard, Real-Time Collaboration
- **Create New Room** button — generates a unique room code
- **Join Room** — enter a room code and optional password
- Show logged-in user's name

## 3. Room System (Google Meet–style)
- Each room gets a unique shareable code (e.g., "ABC-123")
- Optional room password protection
- Room creator is the "host"
- Anyone with the code can join and is automatically added to the **Contributors** list
- Contributor sidebar shows all users in the room with join time and online status (green dot)
- Supabase Realtime Presence to track who's online

## 4. Code Editor with C++ Compilation
- Monaco Editor (VS Code's editor) with C++ syntax highlighting
- **Run** button that compiles and executes C++ code via Judge0 API (edge function)
- Input field for stdin (optional program input)
- Output panel showing compilation results, errors, and program output
- Real-time code syncing across all room members via Supabase Realtime

## 5. Real-Time Chat Panel
- Collapsible chat sidebar on the right
- Messages show username, timestamp, and online indicator
- Support for @mentions of other collaborators
- Messages stored per room in Supabase

## 6. Whiteboard
- Toggle between Code and Whiteboard views
- Drawing canvas with tools: pointer, pen, rectangle, arrow, text, undo, eraser
- Real-time syncing of drawings across all room members
- Built using HTML Canvas

## 7. Room Controls (Top Bar)
- Toggle between Code / Whiteboard views
- Language selector (showing C++ as the option)
- Collaborators, Chat, Share, and Copy Room Code buttons
- Cursor position indicator (Line, Column)

## 8. Backend (Supabase + Edge Functions)
- **Database tables**: profiles, rooms, room_members, chat_messages
- **Edge function**: `compile-cpp` — proxies code to Judge0 API for compilation
- **Realtime channels**: code sync, chat messages, presence/contributors
- RLS policies to secure room data

## 9. Design & Theme
- Dark theme matching the screenshots (dark navy/charcoal background)
- Cyan/blue accent colors for active states
- Purple accent for create buttons
- Clean, minimal UI with collapsible sidebars

