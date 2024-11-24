# QuestLog

QuestLog is a gamified task management web application that transforms your daily tasks into rewarding quests. Built with React and MongoDB, it combines productivity with engaging game mechanics to make task completion more enjoyable.

## Experience System
QuestLog features a dynamic XP system that rewards strategic task management:

### Task XP
When creating tasks, you control your potential rewards by setting:
- Task Difficulty (Easy, Medium, Hard)
- Task Importance (Low, Medium, High)

The higher the difficulty and importance, the more XP you'll earn upon completion!

### Time Management Bonuses
Plan ahead and complete tasks early to earn bonus XP:
- Complete tasks well ahead of deadline for maximum bonus
- Early completion bonuses scale with how early you finish
- Same-day completion still earns you a small bonus

### Progression
- Experience points contribute to your level
- Each level requires more XP than the previous
- Watch your progress bar fill as you complete tasks
- Level-ups are celebrated with special animations!

## Features
- **Task Management**: Create, complete, and track your daily tasks
- **Gamification**:
  - Earn XP for completing tasks
  - Level up system with celebratory notifications
  - Daily streaks tracking
  - Customizable task difficulty and importance ratings with optional deadlines
- **User Experience**:
  - Responsive design for all devices
  - Dark/Light theme toggle
  - Smooth animations and transitions
  - Clean, modern interface
- **Data Management**:
  - Google OAuth 2.0 authentication
  - Cloud sync across devices
  - Local storage fallback for guests
  - **Leaderboard participation**. Users can either Opt-in or Opt-out of it. It is completely optional to respect privacy. 

## Architecture

![image](https://github.com/user-attachments/assets/f0e60564-0c06-487e-96bd-bdd364a256e5)

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