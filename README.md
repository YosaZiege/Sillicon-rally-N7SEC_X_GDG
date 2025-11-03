# Sillicon Ralley

Welcome to the Security Challenge Arena! This is an interactive and educational web application designed to teach cybersecurity concepts through a series of fun, hands-on challenges. It's built for students of all backgrounds and requires no prior coding knowledge.

## Features:

- **Team-Based Login**: Users participate as teams.
- **Admin Dashboard**: A special `l7ajroot` user can access a dashboard to manage teams (create, edit, delete, grant admin status).
- **Multiple Challenge Types**: A variety of challenges to test different security skills:
  - **Password Master**: Create strong passwords against the clock.
  - **Phishing Detective**: Identify scam emails from legitimate ones.
  - **Secret Message Decoder**: Solve various ciphers and decoding puzzles.
  - **Spot the Scam Quiz**: Test your knowledge of real-world scam scenarios.
  - **Digital Footprint Simulator**: See how online choices affect your digital privacy.
  - **OSINT GeoGuessr**: Use Open-Source Intelligence clues in an image to find a location on a map.
  - **Captcha Challenge**: Prove you're not a robot by solving various types of CAPTCHAs.
  - **Social Engineering**: Navigate tricky social situations and make the right security call.
- **Live Leaderboard**: Team scores are updated and displayed in real-time.
- **Certificate of Completion**: Users can generate and download a personalized certificate after finishing all challenges.
- **Theming**: Supports both light and dark modes.

## Tech Stack

This project is built with a modern robust tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Containerization**: [Docker](https://www.docker.com/)
- **UI Framework**: [React](https://reactjs.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible components.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **State Management**: React Context API combined with `useReducer` for centralized and predictable state management across the app.
- **Session Management**: [Iron Session](https://github.com/vvo/iron-session) for stateless, encrypted session management stored in cookies
- **Mapping**: [Leaflet](https://leafletjs.com/) for the interactive map in the GeoGuessr challenge.
- **Icons**: [Lucide React](https://lucide.dev/) for a clean and consistent icon set.

### Backend & Data

For simplicity and ease of setup, this project currently uses a **file-based backend**:

- API routes under `src/app/api/` handle all backend logic.
- Data for teams and the leaderboard is stored in JSON files within the `src/data/` directory.
- User progress is saved in the browser's `localStorage`, scoped to the team name.

## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or another package manager like [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/).
- [Docker](https://www.docker.com/products/docker-desktop/) (for containerized setup)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/security-challenge-arena.git
    cd security-challenge-arena
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add a secret password for encrypting session cookies.

    ```.env.local
    # This should be a long, random, and secret string (at least 32 characters).
    SECRET_COOKIE_PASSWORD="your-super-secret-password-for-iron-session"
    ```

### Running the Development Server

Once the installation is complete, you can start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

### Running with Docker

This project includes a Docker setup for a consistent and isolated development environment.

1. **Build and run the Docker container:**
    Make sure you have created the `.env.local` file as described in the installation steps. Then, from the root of the project, run:

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker image and start the application. The app will be accessible at [http://localhost:9002](http://localhost:9002).

## How to Use

- **Team Login**: Enter any team name to start. A team must be created by an admin first unless it is the default admin team.
- **Admin Access**: To access the admin dashboard, log in with the team name `l7ajroot`. From there, you can create and manage other teams.
