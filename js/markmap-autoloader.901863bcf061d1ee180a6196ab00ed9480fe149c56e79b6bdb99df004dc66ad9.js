const markmapInstances = new WeakMap();
const { Transformer } = window.markmap;
const { Markmap } = window.markmap;
const { Toolbar } = window.markmap;
// 传入空数组禁用自带的math插件（同时包括其他自带插件），保留$符号，让外部的math渲染生效
const transformer = new Transformer([]);
isHandling = false;

function createSvgIcon(svgStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, "image/svg+xml");
    return doc.querySelector("svg");
}

const fullscreenIcon = createSvgIcon('<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024" width="20" height="20"><path d="M181 357.5V181.2h176.4c14.3 0 25.9-11.6 25.9-25.9v-31.1c0-14.3-11.6-25.9-25.9-25.9H118c-11 0-20 9-20 20v239.4c0 14.3 11.6 25.9 25.9 25.9H155c14.4-.1 26-11.7 26-26.1m487.6-176.3H845v176.4c0 14.3 11.6 25.9 25.9 25.9H902c14.3 0 25.9-11.6 25.9-25.9V118.2c0-11-9-20-20-20H668.6c-14.3 0-25.9 11.6-25.9 25.9v31.1c0 14.3 11.6 26 25.9 26m-311.2 664H181V668.8c0-14.3-11.6-25.9-25.9-25.9H124c-14.3 0-25.9 11.6-25.9 25.9v239.4c0 11 9 20 20 20h239.4c14.3 0 25.9-11.6 25.9-25.9v-31.1c-.1-14.4-11.7-26-26-26M845 668.8v176.4H668.6c-14.3 0-25.9 11.6-25.9 25.9v31.1c0 14.3 11.6 25.9 25.9 25.9H908c11 0 20-9 20-20V668.8c0-14.3-11.6-25.9-25.9-25.9H871c-14.4 0-26 11.6-26 25.9" fill="currentColor" fill-rule="evenodd"/></svg>');

async function renderAllMarkmap() {
    const containers = document.querySelectorAll('.markmap');
    for (const wrapDiv of containers) {
        if (markmapInstances.has(wrapDiv)) continue;

        const codeEl = wrapDiv.querySelector('code.language-markmap');
        const svgEl = wrapDiv.querySelector('svg');
        if (!codeEl || !svgEl) continue;

        const md = codeEl.textContent.trim();
        const { root, features } = transformer.transform(md);

        if (!root) {
            console.error("markmap解析失败，root为空");
            continue;
        }
        const mm = await Markmap.create(svgEl, {}, root);
        markmapInstances.set(wrapDiv, mm);

        // 手动渲染Toolbar
        const toolbar = Toolbar.create(mm);
        const { el: toolbarEl } = toolbar;

        // 注册自定义全屏按钮
        toolbar.register({
            id: 'fullscreen',
            title: '全屏预览导图', // hover提示
            content: fullscreenIcon,
            onClick: () => {
                // 如果正在处理，直接返回，防止重复执行
                if (isHandling) return;
                isHandling = true; // 上锁

                if (!document.fullscreenElement) {
                    // 让导图容器进入全屏
                    wrapDiv.requestFullscreen().catch(err => {
                        console.error(`全屏失败: ${err.message}`);
                    });
                    wrapDiv.style.setProperty('border', 'none', 'important');
                    // 防止全屏后高度变小
                    svgEl.style.setProperty('height', '100vh', 'important');
                } else {
                    svgEl.style.height = '';
                    wrapDiv.style.border = '';
                    document.exitFullscreen();
                }

                // 延迟解锁，等fullscreenchange事件触发完毕再放开锁
                setTimeout(() => {
                    isHandling = false;
                }, 50);
            }
        });

        document.addEventListener('fullscreenchange', () => {
            // 如果是我们代码主动触发的，上锁状态，直接跳过
            if (isHandling) return;

            // 👉 只有ESC、浏览器退出等【外部方式】退出全屏，才走到这里
            if (!document.fullscreenElement) {
                // 恢复样式
                svgEl.style.height = '';
                wrapDiv.style.border = '';
            }
        });

        // 把全屏按钮追加到原有工具栏末尾
        toolbar.setItems([...Toolbar.defaultItems, 'fullscreen']);
        // 挂载到外层wrapDiv（position:relative容器）
        wrapDiv.appendChild(toolbarEl);

        if (features?.styles) markmap.loadCSS(features.styles);
        if (features?.scripts) markmap.loadJS(features.scripts, { getMarkmap: () => window.markmap });
    }
}

document.addEventListener('DOMContentLoaded', renderAllMarkmap);

// 监听 html 标签上 data‑bs‑theme 属性变化
const htmlElement = document.documentElement;

// 同步 markmap‑dark class
function syncMarkmapDarkClass() {
    const currentTheme = htmlElement.getAttribute('data-bs-theme');
    if (currentTheme === 'light') {
        htmlElement.classList.remove('markmap-dark');
    } else if (currentTheme === 'dark') {
        htmlElement.classList.add('markmap-dark');
    }
}

// 创建 MutationObserver 监听属性变化
const themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.attributeName === 'data-bs-theme') {
            syncMarkmapDarkClass();
        }
    }
});

// 启动观察
themeObserver.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme']
});

// 获取当前主题
function getBsTheme() {
    return htmlElement.getAttribute('data-bs-theme');
}

syncMarkmapDarkClass();