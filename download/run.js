const listId = "list";
const downlistId = "downlist";
const popupId = "mimicry_popup";
const adaptBodyId = "adaptBody";

var data = [];

function loadData() {
    let listWidget = document.getElementById(listId);
    if (null != listWidget) {
        let innerHtml = "";
        for (let i = 0; i < data.length; ++i) {
            let item = data[i];
            let systemName = systemTypeToViewName(item["type"]);
            let branchName = branchTypeToViewName(item["branch"]);
            let depict = getDepict(item["type"], item["branch"]);
            innerHtml += `
            <li class="cmusic_playlist_li_notransform" style="margin-top: 10px;margin-bottom: 10px;">
                <div class="mimicry_row" style="justify-content: space-between;">
                    <div class="mimicry_row" style="align-items: center;">
                        <span class="cmusic_textMain">${systemName} ${branchName}</span>
                    </div>
                    <button class="mimicry_button" onClick="download(${i})">下载</button>
                </div>
                <div class="mimicry_row"
                style="width:min-content;background-color: #66ccff;border-radius: 5px;padding-left: 5px;padding-right: 5px;margin-bottom:10px;align-items: center;justify-content: center;height:min-content;">
                <span class="cmusic_textCross" style="color: #fff;">${item['version_str']}</span>
            </div>
                <span class="cmusic_textCross" style="white-space: pre-line;">${depict}</span>
            </li>
                         `;
        }
        listWidget.innerHTML = innerHtml;
        return true;
    }
    return false;
}

function download(index) {
    let item = data[index];
    let list = JSON.parse(item["downlist"]);
    if (list.length == 0) {
        window.open(item["link"], "_blank");
    } else if (list.length == 1) {
        window.open(list[0]["link"], "_blank");
    } else {
        let innerHtml = "";
        for (let i = 0; i < list.length; ++i) {
            let item = list[i];
            innerHtml += `
            <li class="cmusic_playlist_li_notransform" style="padding-top: 20px;padding-bottom: 20px;">
                <div class="mimicry_row" style="justify-content: space-between;">
                    <span class="cmusic_textMain">${item["name"]}</span>
                    <button 
                        class="${(item["name"] == "arm64") ? "mimicry_button" : 'mimicry_button mimicry_button_normal'}"
                        onClick="downloadLink('${item["link"]}')"
                        >下载</button>
                </div>
                <span class="cmusic_textCross">${item["depict"]}</span>
            </li>
                         `;
        }
        let popupWidget = document.getElementById(downlistId);
        popupWidget.innerHTML = innerHtml;
        popupOpen();
    }
}

function downloadLink(link) {
    if (link && link.length > 0) {
        window.open(link, "_blank");
    }
}

function popupOpen() {
    let popupWidget = document.getElementById(popupId);
    if (null != popupWidget) {
        popupWidget.style = "display: flex;";
    }
}

function popupClose() {
    let popupWidget = document.getElementById(popupId);
    if (null != popupWidget) {
        popupWidget.style = "display: none;";
    }
}

function removeBobbom() {
    return false;
}

function autoAdaptLayout() {
    let bodyWidget = document.getElementById(adaptBodyId);
    if (window.innerHeight > window.innerWidth) {
        // 竖屏
        bodyWidget.classList = ["mimicry_column"];
    } else {
        // 横屏
        bodyWidget.classList = ["mimicry_row"];
    }
    bodyWidget.style = "display:flex;";
}

window.onresize = autoAdaptLayout;

window.onload = () => {
    // 自适应横竖屏
    autoAdaptLayout();
    // 请求下载列表
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = async function () {
        if (xhr.readyState == 4) {
            let rebool = (() => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    data = JSON.parse(xhr.responseText)["data"]
                    console.log(data)
                    data.sort((a, b) => {
                        if (a["system"] == b["system"]) {
                            if (a["branch"] == b["branch"]) {
                                return 0;
                            } else {
                                if (a["branch"] == "Main") {
                                    return -1;
                                } else {
                                    return 1;
                                }
                            }
                        } else {
                            if (a["system"] == "android") {
                                return -1;
                            } else {
                                return 1;
                            }
                        }
                    });
                    return loadData();
                } else {
                    console.log(error)
                }
                return false;
            })();
            if (true === rebool) {
                // 加载成功
            } else {
                // 加载失败
                let listWidget = document.getElementById(listId);
                if (null != listWidget) {
                    listWidget.innerHTML = `
                <li class="cmusic_playlist_li_notransform" style="display: flex;justify-content: center;align-items: center;">
                    <span class="cmusic_textMain" style="color: #F00">『下载列表加载失败』</span>
                </li>
`;
                }
            }
        }
    };
    xhr.open("GET", "https://api.music.mimicry.cool/api/procedure/get/download/list", true);
    xhr.send(null);
};

function systemTypeToViewName(type) {
    switch (type) {
        case "android":
            return "安卓";
        case "windows":
            return "windows";
        case "macos":
            return "macos";
        case "linux":
            return "linux";
    }
    return "";
}

function branchTypeToViewName(type) {
    switch (type) {
        case "SPA4":
            return "泛支持版";
        case "Main":
            return "完整版";
    }
}

function getDepict(system, branch) {
    switch (system) {
        case "android":
            if (branch == "Main") {
                return `• 系统要求：Android 5.0 或以上; 
• 完整的播放能力和功能支持。`;
            } else if (branch == "SPA4") {
                return `• 系统要求：Android 4.1 或以上;
• 当完整版闪退时可尝试该版本。
• 支持安卓4.x，移除了播放组件Libmpv，因此缺失了部分播放能力。`;
            }
        case "windows":
            if (branch == "Main") {
                return `• 系统要求：x64 Windows 10 或以上`;
            }
        case "macos":
            return `• 系统要求：arm64/x64 Macos11 或以上
• 实现了部分基础功能，体验尝鲜~`;
        case "linux":
            return `• 系统要求：arm64/x64
• 实现了部分基础功能，体验尝鲜~`;
    }
    return ""
}
