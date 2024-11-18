# QuestLog
QuestLog is a gamified productivity web application built with React and backed by a MongoDB database. It helps users manage their tasks while providing a rewarding experience through a level-up system and leaderboard competition.

## Features
- **Task Management**: Add, complete, and remove tasks
- **Gamification**: Earn XP and level up by completing tasks
- **Authentication**: Secure Google OAuth 2.0 login integration
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Difficulty and Importance Ratings**: Assign ratings to tasks to determine XP rewards
- **Progress Tracking**: Visual representation of current level and XP progress
- **Streak Tracking**: Tracks the current and longest streak of daily task completions
- **Leaderboard**: Compare your progress with other users
- **Persistent Storage**: 
  - Authenticated users: Tasks and progress are saved in MongoDB and synced across devices
  - Guest users: Data persists in local storage
- **Task Organization**: Separate views for active and completed tasks
- **XP System**: Dynamic XP calculation based on task difficulty and importance
- **Level Up Notifications**: Celebratory modal when reaching new levels
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Live Demo
Check out the live demo of QuestLog [here](https://smart-listapp.vercel.app/).

| ![Image 1](https://github.com/user-attachments/assets/9f6d85ef-6a0d-4409-85f7-f0b0c29e6261) | ![Image 2](https://github.com/user-attachments/assets/9d0a5af9-e016-41bd-abcc-cdcba2bd39e5) |
| --- | --- |
| ![image](https://github.com/user-attachments/assets/ed0c0029-9bd5-4fbe-a82a-88374a854289) | ![Image 2](https://github.com/user-attachments/assets/86a2c415-de61-4b36-bfed-49e26bd4dd47) |
| --- | --- |

## Architecture
- **Frontend**: React application hosted on Vercel
- **Backend**: Express.js server hosted on Vercel
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with dark mode support

## Getting Started
### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB account and database
- Google Cloud Platform account for OAuth

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/hussaino03/QuestLog.git
   ```
2. Navigate to the project directory:
   ```bash
   cd QuestLog
   ```
3. Install dependencies for both frontend and backend:
   ```bash
   npm install
   cd server && npm install
   ```
4. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open your browser and visit `http://localhost:3000` to see the app running.

## Usage
1. Open the app in your browser
2. Sign in with your Google account (optional)
3. Click on "New Task" to add a new task
4. Fill in the task details:
   - Name
   - Description (optional)
   - Difficulty (affects XP reward)
   - Importance (affects XP reward)
5. Click on the checkmark (✔️) next to a task to complete it and earn XP
6. Toggle between active and completed tasks using the task buttons
7. Watch your progress bar fill up as you complete tasks and level up!
8. Check the leaderboard to see how you compare to other users
9. Use the theme toggle to switch between light and dark modes

## API Endpoints
- `POST /api/users`: Create or retrieve a user
- `GET /api/users/:id`: Get user data
- `PUT /api/users/:id`: Update user data (XP, level, tasks completed)
- `GET /api/leaderboard`: Retrieve leaderboard data
- `POST /api/auth/google`: Handle Google OAuth authentication

## Data Persistence
- **Authenticated Users**: 
  - All data synced with MongoDB
  - Available across devices
  - Progress tracked on leaderboard
- **Guest Users**:
  - Data stored in local storage
  - Limited to current browser/device
  - Not visible on leaderboard

## Testing
Run the test suite with:
```bash
npm test
```

## Built With
- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) - Authentication
- [React Transition Group](https://reactcommunity.org/react-transition-group/) - Animations

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments
- Thanks to all contributors who have helped shape QuestLog
- Inspired by productivity apps and RPG games
- Special thanks to the React and MongoDB communities
