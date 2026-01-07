const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 450,
    frame: false,
    resizable: false,
    // ATUALIZADO: Agora busca o arquivo favicon.ico
    icon: path.join(__dirname, 'favicon.ico'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      autoplayPolicy: 'no-user-gesture-required' 
    }
  });

  win.loadFile('index.html');

  // Controle de minimizar
  ipcMain.on('minimizar-app', () => {
    if (win) win.minimize();
  });

  // Controle de restaurar janela
  ipcMain.on('mostrar-janela', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
      win.setAlwaysOnTop(true);
      setTimeout(() => { win.setAlwaysOnTop(false); }, 1000);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});