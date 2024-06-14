# FitTrack

FitTrack is a web application that helps users track their fitness journey and visualize their progress. It provides a user-friendly interface for logging workouts, tracking nutrition intake, and seeing visual representations of their data.

## Features

- Log workouts with exercise details, sets, reps, and weights
- Track daily nutrition intake and calories consumed
- View progress through interactive charts and graphs
- Secure user authentication and profile management
- Responsive design for seamless usage across devices

## Technologies Used

- Frontend: React, Next.js, Tailwind CSS, Recharts
- Backend: Next.js API routes, PostgreSQL, Drizzle ORM
- Authentication: Clerk
- Data Visualization: Recharts

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/aryan877/fit_track.git
   ```

2. Install the dependencies:

   ```
   cd fit_track
   npm install
   ```

3. Set up the database and environment variables:

   - Create a PostgreSQL database
   - Create a `.env.local` file at the root level
   - Set `POSTGRES_CONNECTION_STRING` env variable in `.env.local`
   - Set the Clerk Auth env variables

4. Run the development server:

   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000` to access FitTrack.
