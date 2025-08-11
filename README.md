# CheetahType - Typing Speed Test Application

CheetahType is a modern typing test application built with Next.js. It helps users improve their typing speed and accuracy through interactive typing tests and provides detailed statistics and leaderboards.

## Features

- Multiple typing test modes (15s, 30s, 60s, 120s)
- Real-time WPM, accuracy, and consistency calculation
- User authentication with Firebase
- Persistent user profiles and settings
- Global leaderboards
- Detailed typing statistics
- Responsive design for all devices

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Authentication**: Firebase Authentication
- **Deployment**: Vercel

## Getting Started
### Supabase Schema (proposed)

Use these tables to support users, tests, leaderboard, and multiplayer. Prefer camelCase in code and snake_case in DB.

1. users
   - id (text, PK) — Firebase UID or provider UID
   - email (text, unique)
   - display_name (text)
   - photo_url (text)
   - email_verified (boolean, default false)
   - created_at (timestamptz, default now())
   - updated_at (timestamptz)
   - last_login_at (timestamptz)

2. tests
   - id (uuid, PK, default gen_random_uuid())
   - user_id (text, FK -> users.id)
   - wpm (integer)
   - raw_wpm (integer)
   - accuracy (numeric)
   - consistency (numeric)
   - characters (integer)
   - errors (integer)
   - duration (integer) — seconds
   - test_type (text) — e.g., time/words/quote
   - test_mode (text) — e.g., 15/30/60/120
   - text_content (text)
   - created_at (timestamptz, default now())

3. multiplayer_lobbies
   - id (uuid, PK, default gen_random_uuid())
   - host_user_id (text, FK -> users.id)
   - status (text) — waiting/active/finished
   - settings (jsonb) — room config like mode, time, words
   - created_at (timestamptz, default now())
   - updated_at (timestamptz)

4. multiplayer_players
   - lobby_id (uuid, FK -> multiplayer_lobbies.id)
   - user_id (text, FK -> users.id)
   - joined_at (timestamptz, default now())
   - primary key (lobby_id, user_id)

5. multiplayer_results
   - id (uuid, PK)
   - lobby_id (uuid, FK -> multiplayer_lobbies.id)
   - user_id (text, FK -> users.id)
   - wpm, accuracy, characters, errors, duration (numeric/int)
   - created_at (timestamptz, default now())

Views/Indexes:
 - tests_view_leaderboard: materialized or standard view that selects best recent tests (e.g., last 24h) with user display name. Index by (test_mode, wpm desc, accuracy desc).

Row Level Security:
 - users: user can select own row, update own row
 - tests: user can insert own rows, select own rows; public can select for leaderboard (only aggregated/latest fields)
 - multiplayer tables: appropriate policies for participants

### API Contracts

GET /api/leaderboard?mode=30&limit=50 -> { entries: Array<{ id, user_id, display_name, wpm, accuracy, test_mode, created_at }> }


### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cheetahtype.git
   cd cheetahtype
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Structure

The application stores data using Firebase:

1. User information and preferences
2. Individual typing test results
3. Entries for the global leaderboard

## API Endpoints

- `/api/result` - Save typing test results
- `/api/leaderboard` - Fetch leaderboard data
- `/api/stats/site` - Fetch site-wide statistics
- `/api/stats` - Fetch user typing statistics

## Deployment

The application is set up for easy deployment on Vercel:

```bash
npm run build
vercel --prod
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 