# QuestLog

![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-170-blue?logo=mongodb&logoColor=white) ![Total User XP](https://img.shields.io/badge/Total%20User%20XP-268,838-red?logo=zap&logoColor=white)
<!-- These values update automatically every 1st and 15th of the month -->

QuestLog is a gamified productivity platform that turns your tasks and projects into achievement-driven experiences. Built with React and MongoDB, it enhances work management through XP points, levels, and badges while integrating seamlessly with different app integrations!

## ✨ Key Features
- Transform tasks/projects into rewarding quests
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
- Displays XP Progression chart, & other key analytics for authenticated users
 
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
When creating tasks/projects, you control your rewards through:
- Difficulty Level (Easy, Medium, Hard)
- Importance Level (Low, Medium, High)
- Completion Time (Early completion bonuses)
- _For Tasks:_ Task Type (Solo/Team tasks - Team tasks provide bonus XP)
- Overdue Penalty on tasks that are past the deadline

_Default XP settings are given for Quick Task creation_

## 🛠️ Technical Overview
Built with:
- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) - Authentication
- [Passport.js](https://www.passportjs.org/concepts/authentication/middleware/) - Auth Middleware
- [Docker](https://www.docker.com/) - Container Orchestration

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
        ModalManager[Task/Project Management]
        GameSystem[Game Systems]
        ClientStore[(Local Storage)]
    end

    %% Backend Layer
    subgraph Backend["Backend (Express.js)"]
        direction TB
        Server[Server.js]
        AuthService[Auth Service]
        ItemService[Task/Project Service]
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
    ModalManager --> ItemService
    ModalManager --> IntegrationService
    GameSystem --> GameService
    AuthService --> OAuth
    IntegrationService --> AppIntegrations
    Session --> SessionStore
    
    %% Frontend Flow
    App --> Auth & ModalManager & GameSystem & ClientStore
    
    %% Backend Flow
    Server --> AuthService & ItemService & GameService & IntegrationService & Session
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

1. Clone the repository:
   ```bash
   git clone https://github.com/hussaino03/QuestLog.git
   cd QuestLog
   ```

2. Set up environment variables:
   ```bash
   # Copy the example environment file
   cp example.env .env

   # Open .env and update all the required variables with your values
   # Make sure to set:
   # - MONGODB_URI for your database
   # - Google OAuth credentials
   # - Integration API keys
   # - Other required variables
   ```

3. Build and start with Docker:
   ```bash
   # Build and start all services
   docker-compose up --build

   # Or run in detached mode
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

5. To stop the application:
   ```bash
   docker-compose down
   ```

## 💻 Usage
### Account Setup
- Launch QuestLog in your browser
- Choose between Google sign-in or guest mode
- Customize your theme preference (light/dark)

### Task Management
- Create new tasks/projects via the "Create +" button
- Toggle between task view and project view
- Configure each with:
  - Title, description, deadline & XP settings
- Filter between active and completed items

### Progress Tracking
- Monitor your XP bar and level progression
- Earn bonus XP for early completion
- View your position on the leaderboard 
- Track daily completion streaks

## 🔧 API Endpoints
- `POST /api/users`: Create or retrieve a user
- `GET /api/users/:id`: Get user data
- `PUT /api/users/:id`: Update user data (XP, level, tasks/projects completed)
- `GET /api/leaderboard`: Retrieve leaderboard data
- `POST /api/auth/google`: Handle Google OAuth authentication
- `GET /api/auth/<integrations>` : integrations OAuth import

## 💾 Data Persistence
- **Authenticated Users**: 
  - All data synced with MongoDB
  - Available across devices
  - Progress tracked on leaderboard
- **Guest Users**:
  - Data stored in local storage
  - Limited to current browser/device
  - Not visible on leaderboard

## 💳 Support
If you find QuestLog helpful and would like to support its development:

[![PayPal](https://img.shields.io/badge/PayPal-Support%20Development-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/hussaino03)

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
