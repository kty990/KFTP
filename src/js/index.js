const fromDir = document.getElementById('fromDir');
const fromLabel = fromDir.parentElement.querySelector("#selected")
const toDir = document.getElementById('toDir');
const toLabel = toDir.parentElement.querySelector("#selected")

const transferBtn = document.getElementById("transfer");
const copy_moveBtn = document.getElementsByClassName("toggle")[0];

const fileList = document.getElementById('files');
const transferList = document.getElementById("transfered");

const _console = document.getElementById("console");

function decodeURL(str) {
    return decodeURIComponent(str);
}

function toConsole(color, value) {
    let tmp = document.createElement('p');
    tmp.style.color = color;
    tmp.innerHTML = value;
    _console.appendChild(tmp);
}

let transfering = false;
transferBtn.addEventListener("click", async () => {
    if (transfering) return;
    transfering = true;
    let children = Array.from(fileList.children);
    const informEveryTransfer = children.length < 10;
    for (let i = 0; i < children.length; i++) {
        let c = children[i];
        // console.log(`From renderer, trying to transfer file: ${fromLabel.textContent}\\${c.textContent} to ${toLabel.textContent}`)
        let success = await window.api.invoke(`transferFile${(copy_moveBtn.textContent == "Copy") ? 'Copy' : ''}`, [`${fromLabel.textContent}\\${c.textContent}`, toLabel.textContent]);
        // console.log(`Success variable`, success);
        if (!success[0]) {
            toConsole("#7d0000", `❌ ${success[1]}`)
            continue;
        } else {
            if (informEveryTransfer) {
                toConsole("#ffffff", `✅ Successfully transfered <strong>"${fromLabel.textContent}\\${c.textContent}"</strong> to <strong>"${toLabel.textContent}\\${c.textContent}"</strong>`);
            }
        }
        if (copy_moveBtn.textContent != "Copy") {
            c.remove();
        }
        let tmp = document.createElement("p");
        tmp.textContent = c.textContent;
        transferList.appendChild(tmp);
    }
    toConsole("#ffffff", `✅ Successfully transfered <strong>[${children.length}]</strong> images to <strong>"${toLabel.textContent}"</strong>\nMove/Copy status: ${copy_moveBtn.textContent == "Copy" ? 'copied the files' : 'moved the files'}`)
    transfering = false;
})

copy_moveBtn.addEventListener("click", () => {
    let copy = copy_moveBtn.textContent == "Copy";
    if (copy) {
        copy_moveBtn.textContent = "Move";
        copy_moveBtn.id = "inactive";
    } else {
        copy_moveBtn.textContent = "Copy";
        copy_moveBtn.id = "active";
    }
})

fromDir.addEventListener('click', async (e) => {
    let result = await window.api.invoke("getDirectory", "Select Directory To Copy From");
    if (!result) return;
    fromLabel.textContent = result;
    fileList.innerHTML = '';
    let files = await window.api.invoke("getFilesInDirectory", result);
    for (let file of files) {
        let tmp = document.createElement('p');
        tmp.textContent = file;
        fileList.appendChild(tmp);
    }
});

toDir.addEventListener('click', async (e) => {
    let result = await window.api.invoke("getDirectory", "Select Directory To Copy To");
    if (!result) return;
    transferList.innerHTML = '';
    toLabel.textContent = result;
    let files = await window.api.invoke("getFilesInDirectory", result);
    for (let file of files) {
        let tmp = document.createElement('p');
        tmp.textContent = file;
        transferList.appendChild(tmp);
    }
});

const oldLog = console.log;
const oldWarn = console.warn;
const oldError = console.error;

console.log = function (...args) {
    oldLog.apply(console, args);
    toConsole("#ffffff", args.join(" "));
}

console.warn = function (...args) {
    oldWarn.apply(console, args);
    toConsole("#ffbb0e", `⚠️ ${args.join(" ")}`);
}

console.error = function (...args) {
    oldError.apply(console, args);
    toConsole("#7d0000", `❌ ${args.join(" ")}`);
}

window.addEventListener("keydown", (ev) => {
    if (ev.ctrlKey) {
        switch (ev.key.toLowerCase()) {
            case "r":
                window.api.send("dev-refresh");
                break;
            case "t":
                window.api.send("toggle-dev-tools");
                break;
        }
    }
})