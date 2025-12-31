const fromDir = document.getElementById('fromDir');
const fromLabel = fromDir.parentElement.querySelector("#selected")
const toDir = document.getElementById('toDir');
const toLabel = toDir.parentElement.querySelector("#selected")

const transferBtn = document.getElementById("transfer");

const fileList = document.getElementById('files');
const transferList = document.getElementById("transfered");

const _console = document.getElementById("console");

function decodeURL(str) {
    return decodeURIComponent(str);
}

function toConsole(color, value) {
    let tmp = document.createElement('p');
    tmp.style.color = color;
    tmp.textContent = value;
    _console.appendChild(tmp);
}

let transfering = false;
transferBtn.addEventListener("click", async () => {
    if (transfering) return;
    transfering = true;
    let children = Array.from(fileList.children);
    for (let i = 0; i < children.length; i++) {
        let c = children[i];
        console.log(`From renderer, trying to transfer file: ${fromLabel.textContent}\\${c.textContent} to ${toLabel.textContent}`)
        let success = await window.api.invoke("transferFile", [`${fromLabel.textContent}\\${c.textContent}`, toLabel.textContent]);
        console.log(`Success variable`, success);
        if (!success[0]) {
            toConsole("#7d0000", success[1])
            continue;
        }
        c.remove();
        let tmp = document.createElement("p");
        tmp.textContent = c.textContent;
        transferList.appendChild(tmp);
    }
    transfering = false;
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