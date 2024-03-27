const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./database.db",
    },
    useNullAsDefault: true,
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    mainWindow.loadURL(`file://${__dirname}/main.html`);
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    ipcMain.on("mainWindowLoaded", function () {
        let result = knex.select("name").from("files");
        result.then(function (rows) {
            mainWindow.webContents.send("resultSent", rows);
        });
    });

    ipcMain.on("setParams", (event, params) => {
        try {
            let result = knex("files").insert({
                name: params.name,
                path: params.path,
            });
            result.then(function (row) {
                console.log("rows: ", row[0]);
                let insertedFileName = knex("files").where("id", row[0]);
                insertedFileName.then(function (row) {
                    mainWindow.webContents.send("insResultSent", row);
                });
            });
        } catch (error) {
            console.log(error);
        }

        console.log("params: ", params.name);
    });

    ipcMain.on("clearDB", (event) => {
        try {
            let result = knex('files').truncate()
            result.then(function () {
                mainWindow.webContents.send("deleteResult");
            })
        } catch (error) {
            console.log(error)
        }
    })
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});
