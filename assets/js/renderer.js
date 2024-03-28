const electron = require("electron");
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

function createListItem(parent, child) {
    let li = createElementWithAttrs(
        "li",
        (id = ""),
        (_class = "list-group-item")
    );
    li.innerHTML = child;
    parent.appendChild(li);
}

function splitString(stringToSplit, separator) {
    return (arrayOfStrings = stringToSplit.split(separator));
}

const submitButton = document.getElementById("submitBtn");
const deleteFilesButton = document.getElementById("deleteFiles");
const filesList = document.getElementById("filesList");

document.addEventListener("DOMContentLoaded", function () {
    ipc.send("mainWindowLoaded");
    let ul = document.getElementById("files");
    ipc.on("resultSent", function (evt, result) {
        for (let i = 0; i < result.length; i++) {
            createListItem(ul, result[i].name);
        }
    });
});

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
        ipc.send("setParams", params);
    } else {
        console.log("Empty Input Field");
    }
});

deleteFilesButton.addEventListener("click", () => {
    ipc.send("clearDB");
});

ipc.on("insResultSent", function (evt, result) {
    let span = document.getElementById("deleteFilesMsg");
    if (span) {
        span.remove();
        let ul = createElementWithAttrs(
            "ul",
            (id = "files"),
            (_class = "list-group ps-0 mt-2")
        );
        filesList.appendChild(ul);
    }
    let ul = document.getElementById("files");
    createListItem(ul, result[0].name);
    filePathInput.value = "";
});

ipc.on("deleteResult", function (event) {
    let ul = document.getElementById("files");
    if (ul) {
        ul.remove();
    }
    let span = createElementWithAttrs(
        "span",
        (id = "deleteFilesMsg"),
        (_class = "badge bg-info text-dark w-100 mt-2 py-3")
    );
    span.innerHTML = "Files Deleted!";
    filesList.appendChild(span);
});
