const electron = require("electron");
const ipc = electron.ipcRenderer;

function createListItem(parent, child) {
    let li = document.createElement("li");
    li.innerHTML = child;
    parent.appendChild(li);
}

function splitString(stringToSplit, separator) {
    return (arrayOfStrings = stringToSplit.split(separator));
}

document.addEventListener("DOMContentLoaded", function () {
    ipc.send("mainWindowLoaded");
    let ul = document.getElementById("files");
    ipc.on("resultSent", function (evt, result) {
        for (let i = 0; i < result.length; i++) {
            createListItem(ul, result[i].name);
        }
    });
});

const submitButton = document.getElementById("submitBtn");

submitButton.addEventListener("click", () => {
    const filePathInput = document.getElementById("filePathInput");
    const filePath = filePathInput.value;
    let fileName = splitString(filePath, "\\").find(
        (element) => element.indexOf(".") != -1
    );
    if (filePath != "") {
        const params = {
            name: fileName,
            path: filePath,
        };
        console.log(params);
        ipc.send("setParams", params);
        ipc.on("insResultSent", function (evt, result) {
            let ul = document.getElementById("files")
            console.log('ul', ul)
            createListItem(ul, result[0].name);
            filePathInput.value = "";
        });
    } else {
        console.log("Empty Input Field");
    }
});

const deleteFilesButton = document.getElementById('deleteFiles')

deleteFilesButton.addEventListener('click', () => {
    ipc.send("clearDB");
    ipc.on('deleteResult', function (event) {
        let filesList = document.getElementById("filesList");
        let span = document.createElement('span')
        span.innerHTML = "Files Deleted!"
        span.setAttribute('id', 'deletedFilesMsg')
        filesList.appendChild(span)
    })
})