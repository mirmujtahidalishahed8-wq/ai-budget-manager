# How to Share Your Project Code 🤝

The best way to share code with a team is using **Git** and **GitHub**.

## Option 1 (Recommended): GitHub (Best for Collaboration)
1. **Initialize Git** (if not already done):
   - In your terminal, run: `git init`

2. **Commit Your Code**:
   - Run: `git add .` (this will stage all your files)
   - Run: `git commit -m "Initial commit of Money Mentor"`

3. **Push to GitHub**:
   - Go to [github.com/new](https://github.com/new) and maximize your window.
   - Create a new repository **Money-Mentor**.
   - Copy the commands under "…or push an existing repository from the command line".
   - Run those commands in your terminal. They will look like:
     ```bash
     git remote add origin https://github.com/YOUR_USERNAME/Money-Mentor.git
     git branch -M main
     git push -u origin main
     ```
   - Now, just send your teammates the URL to your GitHub repo!

4. **For Your Teammates**:
   - They just need to run:
     ```bash
     git clone https://github.com/YOUR_USERNAME/Money-Mentor.git
     cd Money-Mentor
     npm install
     npm start
     ```

## Option 2 (Quick): Share via ZIP
If you don't want to use GitHub, you can zip the folder.

1. **Delete `node_modules`**:
   - Before zipping, maximize space and minimize confusion by deleting the `node_modules` folder (it's huge and unnecessary). Your teammates can regenerate it by running `npm install`.
   
2. **Zip the Folder**:
   - Right-click the `ai-budget-manager` folder -> Send to -> Compressed (zipped) folder.
   
3. **Send the ZIP**:
   - Share this file via WhatsApp, Email, or Google Drive.
   
4. **For Your Teammates**:
   - Unzip the folder.
   - Run `npm install` in the terminal inside the folder.
   - Run `npm start`.
