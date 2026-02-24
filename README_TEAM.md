# How to Set Up Money Mentor (For Teammates)

If you downloaded this code and are missing folders or can't run it, follow these steps.

## The Problem
You probably downloaded the code but didn't run the setup command, so the `node_modules` (which contain the actual code libraries) are missing. GitHub does not store these folders because they are huge.

## The Solution
1. **Open Terminal**: inside this folder (`ai-budget-manager`).
2. **Install Everything**: Run this single command:
   ```bash
   npm run install-all
   ```
   *(This will automatically go into `client` and `server` folders and download all the necessary files).*

3. **Start the App**:
   ```bash
   npm start
   ```

## Folder Structure
Make sure you have these folders:
- `client/` -> Contains the Frontend (React) code.
- `server/` -> Contains the Backend (Node/Express) code.
- `start.js` -> The main script to launch the app.
- `package.json` -> The main configuration file.
