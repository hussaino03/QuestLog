# 🎮 QuestLog

![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-33-blue?logo=mongodb&logoColor=white) ![Total Tasks Completed](https://img.shields.io/badge/Total%20Tasks%20Completed-1234-green?logo=checklist&logoColor=white)
<!-- These values update automatically every 1st and 15th of the month -->

QuestLog is a gamified task management web application that transforms your daily tasks into rewarding quests. Built with React and MongoDB, it combines productivity with engaging game mechanics to make task completion more enjoyable.

## ✨ Key Features
- Transform tasks into rewarding quests
- Track progress with experience points and levels
- Earn bonuses for early completion
- Participate in optional leaderboards
- Seamless data management:
  - Cloud sync for authenticated users
  - Local storage fallback for guests
  - Cross-device accessibility
  - Privacy-focused leaderboard participation

## 🔒 Security
- **Authentication**: 
  - Secure sign-in via Google OAuth 2.0
  - Session-based authentication with Passport.js
  - Secure cookie management with express-session

- **Data Protection**:
  - MongoDB session store
  - Resource ownership verification
  - Password-less authentication flow

- **Network Security**:
  - Express.js security middleware
  - Production-grade CORS policy
  - Rate limiting protection

## 📈 XP System
When creating tasks, you control your rewards through:
- Task Difficulty (Easy, Medium, Hard)
- Task Importance (Low, Medium, High)
- Completion Time (Early completion bonuses)
- There is also an overdue penalty on tasks that are past the deadline 

Watch your progress bar fill as you complete tasks and celebrate as you reach new levels!

## 🛠️ Technical Overview
Built with:
- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) - Authentication

## 🏗️ Architecture

```mermaid
graph TB
    %% External Services Layer
    subgraph External["External Services"]
        GoogleOAuth[Google OAuth 2.0]
    end

    %% Frontend Layer
    subgraph Frontend["Frontend (React)"]
        direction TB
        App[App.js]
        Auth[Auth Component]
        Tasks[Task Management]
        XP[XP Manager]
        Store[(Local Storage)]
    end

    %% Backend Layer
    subgraph Backend["Backend (Express.js)"]
        direction TB
        Server[Server.js]
        AuthRoutes[Auth Routes]
        UserRoutes[User Routes]
        LeaderboardRoutes[Leaderboard Routes]
        Passport[Passport.js]
        Session[Express Session]
    end

    %% Database Layer
    subgraph Database["Database"]
        direction TB
        MongoDB[(MongoDB)]
        Sessions[(Session Store)]
    end

    %% Connections
    Auth --> AuthRoutes
    Tasks --> UserRoutes
    XP --> UserRoutes
    AuthRoutes --> GoogleOAuth
    UserRoutes --> MongoDB
    Session --> Sessions
    
    %% Internal Frontend Connections
    App --> Auth & Tasks & XP & Store
    
    %% Internal Backend Connections
    Server --> AuthRoutes & UserRoutes & LeaderboardRoutes & Session
    AuthRoutes --> Passport
  ```

## 🚀 Quick Start
### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB account and database
- Google Cloud Platform account for OAuth

### Installation

1. Clone and setup the repository:
   ```bash
   git clone https://github.com/hussaino03/QuestLog.git
   cd QuestLog
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. Configure environment variables:

   Create `.env` in the server directory:
   ```
   MONGODB_URI=your_connection_string
   CLIENT=your_client_app_url
   EMAIL_USER=your_email@gmail.com for feedback form
   EMAIL_APP_PASSWORD=your_app_specific_password
   SESSION_SECRET=your session secret
   GOOGLE_CLIENT_ID=your client id from google cloud console
   GOOGLE_CLIENT_SECRET=your oauth password
   ```

   Create `.env` in the client directory:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   REACT_APP_PROD=your_production_api_url
   ```

4. Setup MongoDB:
  
5. Setup Google OAuth:
   
6. Start the application:
   ```bash
   # Start the server (from server directory)
   npm start

   # In a new terminal, start the client (from client directory)
   npm start
   ```

7. Access the application at `http://localhost:3000`

## 💻 Usage
### Account Setup
- Launch QuestLog in your browser
- Choose between Google sign-in or guest mode
- Customize your theme preference (light/dark)

### Task Management
- Create new tasks via the "+" button
- Configure each task with:
  - Title and optional description
  - Difficulty (Easy/Medium/Hard)
  - Importance (Low/Medium/High)
  - Optional deadline for bonus XP
- Mark tasks complete with the checkmark icon
- Filter between active and completed tasks

### Progress Tracking
- Monitor your XP bar and level progression
- Earn bonus XP for early task completion
- View your position on the leaderboard (optional)
- Track daily completion streaks

## 🔧 API Endpoints
- `POST /api/users`: Create or retrieve a user
- `GET /api/users/:id`: Get user data
- `PUT /api/users/:id`: Update user data (XP, level, tasks completed)
- `GET /api/leaderboard`: Retrieve leaderboard data
- `POST /api/auth/google`: Handle Google OAuth authentication

## 💾 Data Persistence
- **Authenticated Users**: 
  - All data synced with MongoDB
  - Available across devices
  - Progress tracked on leaderboard
- **Guest Users**:
  - Data stored in local storage
  - Limited to current browser/device
  - Not visible on leaderboard

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments
- Thanks to all contributors
- Inspired by productivity apps and RPG games
