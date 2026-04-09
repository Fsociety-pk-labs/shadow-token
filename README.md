# Omnivore Corp - Shadow Token CTF

## Description
Omnivore Corp is a global leader in cyber infrastructure and high-governance risk management. Our advanced node architectures are designed to withstand the most sophisticated external threats. Your mission is to infiltrate the Omnivore network, bypass our security protocols, and retrieve the five hidden flags.

## Getting Started

### Prerequisites
- Node.js (v12 or higher)
- npm

### Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd shadow-token
```

2. Install dependencies:
```bash
npm install
```

3. Setup Environment Variables:
The `.env` file is not included in the repository for security reasons. You must create it locally:
```bash
cp .env.example .env
```

4. Start the application:
```bash
npm start
```
The application will be running at `http://localhost:3000`.

### Terminating the Application
Press `Ctrl + C` in the terminal where the process is running.

### Important Security Notes
- **Never commit `.env` file** - It contains sensitive flags and secrets
- The `.env` file is in `.gitignore` and will not be tracked by git
- Each clone/deployment needs its own `.env` file configured locally
