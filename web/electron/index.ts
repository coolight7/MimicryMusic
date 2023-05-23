import { app, BrowserWindow } from "electron";
import path from "path";

const createWindown = () => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    console.log(app.isPackaged, 'isPackaged====>');
    if (app.isPackaged) {
        console.log("packaged====>");
        console.log(__dirname + "../index.html", "path_index.html====>");
        mainWindow.loadFile(path.join(__dirname, "../index.html"));
    } else {
        console.log("no-packaged ====>");
        console.log(`${process.env['VITE_DEV_SERVER_URL']}`, "env====>2");
        mainWindow.loadURL(`${process.env['VITE_DEV_SERVER_URL']}`);
    }
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        if (!process.env.IS_TEST) {
            mainWindow.webContents.openDevTools();
        }
    } else {
        mainWindow.webContents.openDevTools()
    }
}

app.whenReady().then(createWindown);
