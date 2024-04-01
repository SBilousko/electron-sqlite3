const electron = require("electron");
const { BrowserWindow } = require("electron/main");
const ipc = electron.ipcRenderer;

function createElementWithAttrs(el, id = "", _class = "") {
    element = document.createElement(el);
    if (id) {
        element.setAttribute("id", id);
    }
    if (_class) {
        element.setAttribute("class", _class);
    }
    return element;
}

function createListItem(itemType = "li", parent, child) {
    let elem = createElementWithAttrs(
        itemType,
        (id = ""),
        (_class = "list-group-item list-group-item-action")
    );
    if (itemType == "a") elem.setAttribute("href", "#");
    elem.innerHTML = child;
    parent.appendChild(elem);
}

function splitString(stringToSplit, separator) {
    return (arrayOfStrings = stringToSplit.split(separator));
}

const submitButton = document.getElementById("submitBtn");
const deleteFilesButton = document.getElementById("deleteFiles");
const filesListContainer = document.getElementById("filesListContainer");
const filePathInput = document.getElementById("filePathInput");
const filesList = document.getElementById("filesList");
const fileContent = document.getElementById("fileContent");

document.addEventListener("DOMContentLoaded", function () {
    ipc.send("mainWindowLoaded");
    ipc.on("resultSent", function (event, result) {
        for (let i = 0; i < result.length; i++) {
            createListItem("a", filesList, result[i].name);
        }
    });
});

filePathInput.addEventListener("change", function (event) {
    const filePath = this.files[0].path;
    if (filePath != "") {
        const filePathArray = splitString(filePath, "\\");
        const fileName = filePathArray[filePathArray.length - 1];

        params = {
            name: fileName,
            path: filePath,
        };
        console.log("params: ", params);
    } else {
        console.log("Empty Input Field");
    }
});

submitButton.addEventListener("click", (event) => {
    ipc.send("setParams", params);
});

deleteFilesButton.addEventListener("click", (evnt) => {
    ipc.send("clearDB");
});

filesList.addEventListener("click", (event) => {
    let fileName = event.target.text;
    ipc.send("getFileContent", fileName);
});

ipc.on("insResultSent", function (event, result) {
    let messageContainer = document.getElementById("deleteFilesMsg");
    if (messageContainer) {
        messageContainer.remove();
        let filesList = createElementWithAttrs(
            "div",
            (id = "filesList"),
            (_class = "list-group ps-0 mt-2")
        );
        filesListContainer.appendChild(filesList);
    }
    let filesList = document.getElementById("filesList");
    createListItem("a", filesList, result[0].name);
    filePathInput.value = "";
});

ipc.on("fileContent", function (event, data) {
    console.log("data: ", data);
    fileContent.innerHTML = data;
});

ipc.on("deleteResult", function (event) {
    let filesList = document.getElementById("filesList");
    if (filesList) {
        filesList.remove();
    }
    let messageContainer = createElementWithAttrs(
        "span",
        (id = "deleteFilesMsg"),
        (_class = "badge bg-info text-dark w-100 mt-2 py-3")
    );
    messageContainer.innerHTML = "Files Deleted!";
    filesListContainer.appendChild(messageContainer);
});
