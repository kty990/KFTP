const DEBUG_MODE = false;


const fromDir = document.getElementById('fromDir');
const fromLabel = fromDir.parentElement.querySelector("#selected")
const toDir = document.getElementById('toDir');
const toLabel = toDir.parentElement.querySelector("#selected")

const progressBarGreen = document.getElementById("progressBar").querySelector("div");

const transferBtn = document.getElementById("transfer");
const copy_moveBtn = document.getElementsByClassName("toggle")[0];

const fileList = document.getElementById('files');
const transferList = document.getElementById("transfered");

const _console = document.getElementById("console");

function decodeURL(str) {
    return decodeURIComponent(str);
}

function toConsole(color, value) {
    _console.innerHTML = `<p style="color:${color};">${value}</p>` + _console.innerHTML;
}

async function wait(ms) {
    return new Promise(async resolve => {
        setTimeout(resolve, ms);
    })
}

let transfering = false;
transferBtn.addEventListener("click", async () => {
    if (transfering) return;
    if (toLabel.textContent == "-") {
        console.error(`Unable to ${(copy_moveBtn.textContent == "Copy") ? 'copy' : 'move'} items to a null directory.`)
        return;
    }
    transfering = true;
    let children = Array.from(fileList.children);
    const informEveryTransfer = children.length < 10;
    let percentages = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
    console.warn(`Starting transfer!`);
    for (let i = 0; i < children.length; i++) {
        let c = children[i];
        // console.log(`From renderer, trying to transfer file: ${fromLabel.textContent}\\${c.textContent} to ${toLabel.textContent}`)
        let success = await window.api.invoke(`transferFile${(copy_moveBtn.textContent == "Copy") ? 'Copy' : ''}`, [`${fromLabel.textContent}\\${c.textContent}`, toLabel.textContent]);
        // console.log(`Success variable`, success);
        if (!success[0]) {
            console.error(`${success[1]}`)
            continue;
        } else {
            if (informEveryTransfer) {
                console.log(`✅ Successfully transfered <strong>"${fromLabel.textContent}\\${c.textContent}"</strong> to <strong>"${toLabel.textContent}\\${c.textContent}"</strong>`);
            } else {
                // Every 5% send update to console
                if ((i / children.length) * 100 >= percentages[0]) {
                    console.warn(`Update: ${Math.round(i / children.length * 100)}% complete in the transfer`);
                    percentages.shift();
                }
                progressBarGreen.style.right = `${100 - Math.round(i / children.length * 100)}%`;
                if (DEBUG_MODE) {
                    console.error(`${100 - Math.round(i / children.length * 100)}%`)
                }
            }
        }
        if (copy_moveBtn.textContent != "Copy") {
            c.remove();
        }
        let tmp = document.createElement("p");
        tmp.textContent = c.textContent;
        transferList.appendChild(tmp);
        if (DEBUG_MODE) {
            await wait(100);
        }
    }
    console.log(`✅ Successfully transfered <strong>[${children.length}]</strong> images to <strong>"${toLabel.textContent}"</strong>\nMove/Copy status: ${copy_moveBtn.textContent == "Copy" ? 'copied the files' : 'moved the files'}`)
    transfering = false;
})

copy_moveBtn.addEventListener("click", () => {
    if (transfering) {
        console.warn(`Unable to toggle Copy/Move while transfer in progress`);
        return;
    }
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
    if (transfering) {
        console.warn(`Unable to edit 'From' directory while a transfer is in progress`);
        return;
    }
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
    if (transfering) {
        console.warn(`Unable to edit 'To' directory while a transfer is in progress`);
        return;
    }
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
                if (transfering) {
                    console.warn(`Unable to hot-refresh while a transfer is in progress`);
                    return;
                }
                window.api.send("dev-refresh");
                break;
            case "t":
                console.log("Dev tools opened");
                window.api.send("toggle-dev-tools");
                break;
        }
    }
})

fileList.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Reverse the scroll direction to match the reversed layout
    fileList.scrollTop -= e.deltaY;
}, { passive: false });

transferList.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Reverse the scroll direction to match the reversed layout
    transferList.scrollTop -= e.deltaY;
}, { passive: false });