const markmapInstances = new WeakMap();
const { Transformer } = window.markmap;
const { Markmap } = window.markmap;
const { Toolbar } = window.markmap;
// 传入空数组禁用自带的math插件（同时包括其他自带插件），保留$符号，让外部的math渲染生效
const transformer = new Transformer([]);

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
        console.log(root)
        const mm = await Markmap.create(svgEl, {}, root);
        markmapInstances.set(wrapDiv, mm);

        // 手动渲染Toolbar
        const toolbar = Toolbar.create(mm);
        const { el: toolbarEl } = toolbar;

        // 注册自定义全屏按钮
        toolbar.register({
            id: 'fullscreen',
            title: '全屏预览导图', // hover提示
            content: '⛶',
            onClick: () => {
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