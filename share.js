const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Preparing your app for sharing...');

// Function to kill process on port 5000 (Windows specific for now since user is on Windows)
const killPort = () => {
    return new Promise((resolve) => {
        if (os.platform() === 'win32') {
            console.log('🔍 Checking for processes on port 5000...');
            exec('netstat -ano | findstr :5000', (err, stdout) => {
                if (!stdout) {
                    resolve();
                    return;
                }
                const lines = stdout.trim().split('\n');
                const pids = lines.map(line => line.trim().split(/\s+/).pop()).filter(pid => /^\d+$/.test(pid));

                if (pids.length === 0) {
                    resolve();
                    return;
                }

                console.log(`🛑 Killing PIDs: ${[...new Set(pids)].join(', ')}`);
                // Force kill PIDs
                const killCmd = `taskkill /F /PID ${[...new Set(pids)].join(' /PID ')}`;
                exec(killCmd, () => resolve());
            });
        } else {
            // Unix/Mac fallback (though user is on Windows)
            exec('lsof -i :5000 -t | xargs kill -9', () => resolve());
        }
    });
};

const run = async () => {
    try {
        await killPort();
        // Wait a second to ensure port is free
        await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
        console.log('⚠️  Could not auto-kill port. If server fails, please close other terminals.');
    }

    // 1. Build Client (Frontend)
    console.log('📦 Building frontend (this may take a minute)...');

    // Check if client/dist already exists to skip build if needed? No, always build fresh for latest changes.
    const build = exec('npm run build', { cwd: path.join(__dirname, 'client') });

    // Uncomment these if you want to see build logs
    // build.stdout.on('data', (data) => process.stdout.write(data)); 
    // build.stderr.on('data', (data) => process.stderr.write(data));

    build.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ Build failed. Please fix errors and try again.');
            process.exit(1);
        }
        console.log('\n✅ Frontend built successfully!');

        // 2. Start Server (Backend)
        console.log('🌐 Starting server...');
        const server = spawn('node', ['server/server.js'], { cwd: __dirname });

        server.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[Server]: ${output.trim()}`);
            // When server starts listening, start tunnel
            if (output.includes('Server running on port')) {
                startTunnel();
            }
        });

        server.stderr.on('data', (data) => {
            // Ignore benign warnings
            if (!data.toString().includes('DeprecationWarning')) {
                console.error(`[Server Info]: ${data}`);
            }
        });
    });
};

function startTunnel() {
    console.log('🔗 Generating public link...');
    console.log('⏳ Just a moment...');

    // Use npx localtunnel
    const lt = spawn('npx', ['localtunnel', '--port', '5000'], { shell: true });

    lt.stdout.on('data', (data) => {
        const url = data.toString().trim();
        // localtunnel output sometimes contains extra text, regex for url
        const urlMatch = url.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            console.log('\n==================================================');
            console.log(`🎉 YOUR APP IS LIVE: ${urlMatch[0]}`);
            console.log('==================================================');
            console.log('👉 Share this link on WhatsApp/Mobile to access your app!');
            console.log('⚠️  IMPORTANT: When you open the link, request the Desktop Site or click "Click to Continue".');
            console.log('ℹ️  Keep this terminal OPEN to keep the link active.');
        }
    });

    lt.stderr.on('data', (data) => {
        // console.log(`[Tunnel Info]: ${data}`);
    });
}

run();
