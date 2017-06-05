/**
 * Created by hb on 22.04.17.
 */

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const session = electron.session;
const ipcMain = electron.ipcMain;

const windowStateKeeper = require('electron-window-state');

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

var createWindow = function() {

  ipcMain.on('asynchronous-message', function(event, arg) {
    console.log("async msg " + arg);
    event.sender.send('asynchronous-reply', 'pong')
  })

  ipcMain.on('synchronous-message', function(event, arg) {
    console.log("sync msg " + arg);
    event.returnValue = 'pong'
  })

   // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 900
  });

  // Initialize the window to our specified dimensions
  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height
  });

    // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(mainWindow);

  // session.defaultSession.allowNTLMCredentialsForDomains("*.intern");
  // Tell Electron where to load the entry point from
  mainWindow.loadURL(url.format({
                                  pathname: path.join(__dirname, 'index.html'),
                                  protocol: 'file:',
                                  slashes: true
                                }))

  // Clear out the main window when the app is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

}

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
    app.quit();
  // }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();
  // TODO nur fuer dev oeffnen
  mainWindow.webContents.openDevTools();
});

console.log("electron app using:");
console.log("Electron " + process.versions.electron);
console.log("Node.js  " + process.versions.node);
console.log("Chromium " + process.versions.chrome);
console.log("V8       " + process.versions.v8);
