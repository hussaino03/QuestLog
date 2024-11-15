# QuestLog

QuestLog is a gamified productivity web application built with React and backed by a MongoDB database. It helps users manage their tasks while providing a rewarding experience through a level-up system and leaderboard competition.

## Features

- Task management: Add, complete, and remove tasks
- Gamification: Earn XP and level up by completing tasks
- Difficulty and importance ratings: Assign ratings to tasks to determine XP rewards
- Progress tracking: Visual representation of current level and XP progress
- Streak tracking: Tracks the current and longest streak 
- Leaderboard: Compare your progress with other users
- Persistent storage: Tasks and progress are saved in MongoDB and synced across devices
- User identification: Unique session IDs for user tracking without login

## Live Demo

Check out the live demo of QuestLog [here](https://smart-listapp.vercel.app/).

| ![Image 1](https://github.com/user-attachments/assets/9f6d85ef-6a0d-4409-85f7-f0b0c29e6261) | ![Image 2](https://github.com/user-attachments/assets/9d0a5af9-e016-41bd-abcc-cdcba2bd39e5) |
| --- | --- |

| ![image](https://github.com/user-attachments/assets/ed0c0029-9bd5-4fbe-a82a-88374a854289) | ![Image 2](https://github.com/user-attachments/assets/86a2c415-de61-4b36-bfed-49e26bd4dd47) |
| --- | --- |


## Architecture

- Frontend: React application hosted on Vercel
- Backend: Express.js server hosted on Vercel
- Database: MongoDB

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB account and database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/hussaino03/QuestLog.git
   ```
2. Navigate to the project directory:
   ```
   cd QuestLog
   ```
3. Install dependencies for both frontend and backend:
   ```
   npm install
   cd server && npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string: `MONGODB_URI=your_mongodb_connection_string`
5. Start the development server:
   ```
   npm run dev
   ```
6. Open your browser and visit `http://localhost:3000` to see the app running.

## Usage

1. Open the app in your browser. A unique session ID will be generated for you.
2. Click on "New Task" to add a new task.
3. Fill in the task details, including name, description, difficulty, and importance.
4. Click on the checkmark (✔️) next to a task to complete it and earn XP.
5. Watch your progress bar fill up as you complete tasks and level up!
6. Check the leaderboard to see how you compare to other users.

## API Endpoints

- `POST /api/users`: Create or retrieve a user
- `PUT /api/users/:id`: Update user data (XP, level, tasks completed)
- `GET /api/leaderboard`: Retrieve leaderboard data

## Testing

Run the test suite with:
```
npm test
```

## Built With

- [React](https://reactjs.org/) - The web framework used
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Thanks to all contributors who have helped shape QuestLog.
- Inspired by productivity apps and RPG games.
