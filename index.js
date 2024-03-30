const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const TEMP_FOLDER_PATH = path.join(__dirname, "temp");

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

    mainWindow.loadFile("main.html");
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
            let temp_path = path.join(TEMP_FOLDER_PATH, params.name);
            let result = knex("files").insert({
                name: params.name,
                path: params.path,
                temp_path: temp_path,
            });
            result.then(function (row) {
                console.log("rows: ", row[0]);
                let insertedFileName = knex("files").where("id", row[0]);
                insertedFileName.then(function (row) {
                    mainWindow.webContents.send("insResultSent", row);
                });
            });
            console.log("params: ", temp_path);
            fs.cp(params.path, temp_path, (err) => {
                if (err) throw err;
            });
        } catch (error) {
            console.log(error);
        }
    });

    ipcMain.on("clearDB", (event) => {
        try {
            let result = knex("files").truncate();
            result.then(function () {
                mainWindow.webContents.send("deleteResult");
            });
            const directory = "test";

            fs.readdir(TEMP_FOLDER_PATH, (err, files) => {
                if (err) throw err;

                for (const file of files) {
                    fs.unlink(path.join(TEMP_FOLDER_PATH, file), (err) => {
                        if (err) throw err;
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    });
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
