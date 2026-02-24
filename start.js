const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Money Mentor...');

// Ensure Node.js is in PATH (for new installations)
if (process.platform === 'win32') {
    // Check if it's already there to avoid duplicates
    if (!process.env.PATH.includes('C:\\Program Files\\nodejs')) {
        process.env.PATH = "C:\\Program Files\\nodejs;" + process.env.PATH;
    }
} else {
    process.env.PATH = "/usr/local/bin:" + process.env.PATH;
}

// Helper to start process
const startProcess = (name, command, args, cwd) => {
    console.log(`\n📂 Starting ${name}...`);

    // Explicitly pass the modified environment
    const env = { ...process.env };
    if (process.platform === 'win32') {
        const nodePath = 'C:\\Program Files\\nodejs';
        // Double check env.PATH here
        if (!env.PATH) {
            env.PATH = nodePath + ';';
        } else if (!env.PATH.includes(nodePath)) {
            env.PATH = nodePath + ';' + env.PATH;
        }
    }

    const proc = spawn(command, args, {
        cwd,
        shell: true,
        stdio: 'inherit',
        env: env
    });

    proc.on('error', (err) => {
        console.error(`❌ Failed to start ${name}:`, err);
    });

    return proc;
};

// Paths
const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

// 2. Start Server
// On Windows, passing 'npm' to spawn with shell:true works if npm is in PATH.
// If npm is a batch file, we might need to call it directly if shell:true fails to resolve.
// But usually shell:true handles 'npm' if it's in PATH.
const server = startProcess('Backend Server', 'npm', ['run', 'dev'], serverDir);

// 3. Start Client
// Wait a bit for server to init
setTimeout(() => {
    const client = startProcess('Frontend Client', 'npm', ['run', 'dev'], clientDir);
}, 3000);

// Handle exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    server.kill();
    // client.kill(); 
    process.exit();
});
