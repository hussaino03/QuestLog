# QuestLog

![Current Authorized Users](https://img.shields.io/badge/Current%20Authorized%20Users-434-blue?logo=mongodb&logoColor=white) ![Total User XP](https://img.shields.io/badge/Total%20User%20XP-603,601-red?logo=zap&logoColor=white) ![Vercel Deploy](https://deploy-badge.vercel.app/vercel/smart-listapp)
<!-- These values update automatically every 1st and 15th of the month -->

QuestLog is an AI-powered productivity platform that turns task/project management into a rewarding progression system. Through XP points, achievement tracking, and smart insights, it creates an engaging framework that helps users maximize their daily productivity while making personal growth measurable and motivating!

## ✨ Key Features

#### 🤖 AI-Powered Productivity
- Personalized task insights and recommendations
- Analyzes task completion patterns, task completion rates, recent accomplishments, XP progression, and performance trends

#### 👥 Collaborative Projects
- Real-time project sharing and collaboration
- Invite system via shareable codes
- Synchronized progress across team members
- Team activity tracking
- Project-specific collaboration settings

#### 📈 Progress System
- Experience points (XP) and leveling
- Achievement badges 
- Streak system
- Control tasks/projects via different XP settings

#### 📊 Productivity Analytics
- Analytics dashboard
- Performance metrics and trends
- XP growth tracking
- Custom date range insights 

#### 📝 Task/Project Management
- Cloud synchronization
- Project or Task creation
- List/Calendar views
- Label organization

#### 🏆 Social Features
- Public leaderboard

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
    App --> Auth & ModalManager & GameSystem
    
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
- Docker and Docker Compose
- Google OAuth credentials from Google Cloud Console

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hussaino03/QuestLog.git
   cd QuestLog
   ```

2. Set up environment:
   ```bash
   # Copy the example environment file
   cp example.env .env.test

   # Only required changes:
   # - GOOGLE_CLIENT_ID=your_client_id_from_google_cloud_console
   # - GOOGLE_CLIENT_SECRET=your_client_secret_from_google_cloud_console
   # - REACT_APP_GOOGLE_CLIENT_ID=same_as_GOOGLE_CLIENT_ID
   ```

3. Start with Docker:
   ```bash
   docker-compose --env-file .env.test up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

The example.env includes working test values for all other configurations. You only need to provide Google OAuth credentials to get started.

## 🔧 API Endpoints
- `POST /api/users`: Create or retrieve a user
- `GET /api/users/:id`: Get user data
- `PUT /api/users/:id`: Update user data (XP, level, tasks/projects completed)
- `GET /api/leaderboard`: Retrieve leaderboard data
- `POST /api/auth/google`: Handle Google OAuth authentication
- `GET /api/auth/<integrations>` : integrations OAuth import
- `POST /api/projects/:id/share`: Generate project share code
- `POST /api/projects/:id/join`: Join project via share code
- `GET /api/projects/:id/collaborators`: Get project collaborators
- `DELETE /api/projects/:id/collaborators/:userId`: Remove collaborator

## 💾 Data Persistence
- All data synced with MongoDB
- Available across devices
- Progress tracked on the leaderboard

## 💳 Support
If you find QuestLog helpful and would like to support its development:

[![PayPal](https://img.shields.io/badge/PayPal-Support%20Development-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/hussaino03)

## 🤝 Contributing
Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
