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