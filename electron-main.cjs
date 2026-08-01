const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startBackendServer() {
  // Path to the compiled server in the built distribution
  const serverPath = path.join(__dirname, 'dist', 'server.cjs');
  
  // Set required environment variables for the local server
  const env = { 
    ...process.env, 
    NODE_ENV: 'production',
    PORT: '3000'
  };

  serverProcess = spawn('node', [serverPath], { env });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Express Server]: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Express Server Error]: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    title: "Blackspider Media Vault",
    icon: path.join(__dirname, 'public', 'BlackSpiderlogo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // If in development mode, load localhost directly
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, wait 1 second for the local server to start, then load
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000').catch((err) => {
        console.error("Failed to load local server, retrying...", err);
        setTimeout(() => {
          mainWindow.loadURL('http://localhost:3000');
        }, 1000);
      });
    }, 1200);
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // In production, start the bundled Express backend server
  if (process.env.NODE_ENV !== 'development') {
    startBackendServer();
  }
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
