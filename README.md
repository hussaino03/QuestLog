# QuestLog

![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-151-blue?logo=mongodb&logoColor=white) ![Total User XP](https://img.shields.io/badge/Total%20User%20XP-229,893-red?logo=zap&logoColor=white)
<!-- These values update automatically every 1st and 15th of the month -->

QuestLog is a gamified task management web application that transforms your daily tasks into rewarding quests. Built with React and MongoDB, it combines productivity with engaging game mechanics to make task completion more enjoyable.

## ✨ Key Features
- Transform tasks into rewarding quests
- Track progress with experience points and levels
- Earn bonuses for early completion
- Badge system to unlock different achievements
- Participate in optional leaderboards
- Seamless data management:
  - Cloud sync for authenticated users
  - Local storage fallback for guests
  - Cross-device accessibility
  - Privacy-focused leaderboard participation
- Toggle between List View & Calendar View
 
## ⚙️ Integrations

_Tasks will be imported with default XP settings_

- Todoist 
- TickTick  

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
- Task Type (Solo/Team tasks - Team tasks provide bonus XP)
- There is also an overdue penalty on tasks that are past the deadline

_Default XP settings are given for Quick Task creation_

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
        OAuth[OAuth Providers]
        AppIntegrations[App Integrations]
    end

    %% Frontend Layer
    subgraph Frontend["Frontend (React)"]
        direction TB
        App[App.js]
        Auth[Authentication]
        TaskManager[Task Management]
        GameSystem[Game Systems]
        ClientStore[(Local Storage)]
    end

    %% Backend Layer
    subgraph Backend["Backend (Express.js)"]
        direction TB
        Server[Server.js]
        AuthService[Auth Service]
        TaskService[Task Service]
        GameService[Game Service]
        IntegrationService[Integration Service]
        Passport[Passport.js]
        Session[Session Management]
    end

    %% Database Layer
    subgraph Database["Database Layer"]
        direction TB
        MongoDB[(MongoDB)]
        SessionStore[(Session Store)]
    end

    %% Core Connections
    Frontend --> Backend
    Backend --> External
    Backend --> Database

    %% Detailed Connections
    Auth --> AuthService
    TaskManager --> TaskService
    TaskManager --> IntegrationService
    GameSystem --> GameService
    AuthService --> OAuth
    IntegrationService --> AppIntegrations
    Session --> SessionStore
    
    %% Frontend Flow
    App --> Auth & TaskManager & GameSystem & ClientStore
    
    %% Backend Flow
    Server --> AuthService & TaskService & GameService & IntegrationService & Session
    AuthService --> Passport

classDef frontend fill:#42b883,stroke:#333,stroke-width:2px
classDef backend fill:#68a063,stroke:#333,stroke-width:2px
classDef external fill:#f5a623,stroke:#333,stroke-width:2px
classDef database fill:#4479a1,stroke:#333,stroke-width:2px
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
   
   # Auth & Google APIs
   GOOGLE_CLIENT_ID=your client id from google cloud console
   GOOGLE_CLIENT_SECRET=your oauth password

   # Other Integrations
   TODOIST_CLIENT_ID=your client id
   TODOIST_CLIENT_SECRET=your client secret
   TODOIST_REDIRECT_URL=http://localhost:3001/api/auth/todoist/callback or your prod url

   TICKTICK_CLIENT_ID=your client id
   TICKTICK_CLIENT_SECRET=your client secret
   TICKTICK_REDIRECT_URL=http://localhost:3001/api/auth/todoist/callback or your prod url
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
- `GET /api/auth/<integration>` : Integrations OAuth import

## 💾 Data Persistence
- **Authenticated Users**: 
  - All data synced with MongoDB
  - Available across devices
  - Progress tracked on leaderboard
- **Guest Users**:
  - Data stored in local storage
  - Limited to current browser/device
  - Not visible on leaderboard

## ☕ Support
If you find QuestLog helpful and would like to support its development:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Development-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/hsz_11)

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
