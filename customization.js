import { generateQRCode } from './qrGenerator.js';
export let qrOptions = {
    size: 250,
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    level: 'M',
    margin: 25,
    inputText: '',
    inputType: '',
    logo: null,
    logoShape: 'square',
    logoEnabled: false,
    textDescriptionEnabled: false,
    textDescription: ''
};

const MAX_QR_SIZE = 250;

console.log('初始 qrOptions:', JSON.stringify(qrOptions, null, 2));

export function initCustomization() {
    // 获取所有需要的 DOM 元素
    const elements = {
        sizeInput: document.getElementById('size'),
        fgColorInput: document.getElementById('fgColor'),
        bgColorInput: document.getElementById('bgColor'),
        levelSelect: document.getElementById('level'),
        resetBtn: document.getElementById('resetBtn'),
        enableLogoCheckbox: document.getElementById('enableLogo'),
        logoOptionsDiv: document.getElementById('logoOptions'),
        logoUpload: document.getElementById('logoUpload'),
        logoShapeInputs: document.querySelectorAll('input[name="logoShape"]'),
        enableTextDescriptionCheckbox: document.getElementById('enableTextDescription'),
        textDescriptionOptionsDiv: document.getElementById('textDescriptionOptions'),
        textDescriptionInput: document.getElementById('textDescriptionInput')
    };

    // 检查所有元素是否存在
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            console.log('当前 DOM 结构:', document.body.innerHTML);
            return;
        }
    }

    // 为每个控件添加事件监听器
    elements.sizeInput.addEventListener('input', (event) => {
        console.log('Size 输入变化:', event.target.value);
        updateSizeAndRegenerate();
    });
    elements.fgColorInput.addEventListener('input', (event) => {
        console.log('前景色输入变化:', event.target.value);
        updateOptionsAndRegenerate();
    });
    elements.bgColorInput.addEventListener('input', (event) => {
        console.log('背景色输入变化:', event.target.value);
        updateOptionsAndRegenerate();
    });
    elements.levelSelect.addEventListener('change', (event) => {
        console.log('错误级别选择变化:', event.target.value);
        updateOptionsAndRegenerate();
    });
    if(!elements.enableLogoCheckbox) {
        console.log('enableLogoCheckbox 元素未找到');
    }
    elements.enableLogoCheckbox.addEventListener('change', (event) => {
        console.log('启用 Logo 复选框变化:', event.target.checked);
        toggleLogoOptions(event);
    });
    elements.logoUpload.addEventListener('change', (event) => {
        console.log('Logo 上传变化');
        handleLogoUpload(event);
    });
    elements.logoShapeInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            console.log('Logo 形状变化:', event.target.value);
            updateOptionsAndRegenerate();
        });
    });
    elements.enableTextDescriptionCheckbox.addEventListener('change', (event) => {
        console.log('启用文字描述复选框变化:', event.target.checked);
        toggleTextDescription(event);
    });
    elements.textDescriptionInput.addEventListener('input', (event) => {
        console.log('文字描述输入变化:', event.target.value);
        updateOptionsAndRegenerate();
    });
    elements.resetBtn.addEventListener('click', () => {
        console.log('重置按钮被点击');
        resetCustomOptions();
    });

    console.log('initCustomization 函数执行结束');
}

function updateSizeAndRegenerate() {
    const sizeInput = document.getElementById('size');
    qrOptions.size = Math.min(parseInt(sizeInput.value), MAX_QR_SIZE);
    qrOptions.margin = Math.floor(qrOptions.size * 0.1);
    regenerateQRCode();
}

function updateOptionsAndRegenerate() {
    updateOptions();
    regenerateQRCode();
}

function toggleLogoOptions(event) {
    console.log('toggleLogoOptions 被调用');
    const logoOptionsDiv = document.getElementById('logoOptions');
    if(!logoOptionsDiv) {
        console.log('logoOptionsDiv 元素未找到');
    }
    logoOptionsDiv.classList.toggle('hidden', !event.target.checked);
    qrOptions.logoEnabled = event.target.checked;
    console.log('Logo 启用状态更新为:', qrOptions.logoEnabled);
    regenerateQRCode();
}

function toggleTextDescription(event) {
    const textDescriptionOptionsDiv = document.getElementById('textDescriptionOptions');
    textDescriptionOptionsDiv.classList.toggle('hidden', !event.target.checked);
    qrOptions.textDescriptionEnabled = event.target.checked;
    regenerateQRCode();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            qrOptions.logo = e.target.result;
            console.log('Logo 已上传');
            regenerateQRCode();
        };
        reader.readAsDataURL(file);
    }
}

function updateOptions() {
    qrOptions.fgColor = document.getElementById('fgColor').value;
    qrOptions.bgColor = document.getElementById('bgColor').value;
    qrOptions.level = document.getElementById('level').value;
    qrOptions.logoShape = document.querySelector('input[name="logoShape"]:checked').value;
    qrOptions.textDescription = document.getElementById('textDescriptionInput').value.trim();
    qrOptions.logoEnabled = document.getElementById('enableLogo').checked;
    qrOptions.textDescriptionEnabled = document.getElementById('enableTextDescription').checked;
    console.log('更新后的 qrOptions:', JSON.stringify(qrOptions, null, 2));
}

function regenerateQRCode() {
    console.log('尝试重新生成二维码');
    if (qrOptions.inputText) {
        generateQRCode(qrOptions.inputText, qrOptions.inputType);
    } else {
        console.log('没有找到有效的输入内容，无法重新生成二维码');
    }
    console.log('重新生成后的 qrcodeDiv 内容:', document.getElementById('qrcode').innerHTML);
}

function resetCustomOptions() {
    qrOptions = {
        size: 250,
        fgColor: '#000000',
        bgColor: '#FFFFFF',
        level: 'M',
        margin: 25,
        inputText: qrOptions.inputText,
        inputType: qrOptions.inputType,
        logo: null,
        logoShape: 'square',
        logoEnabled: false,
        textDescriptionEnabled: false,
        textDescription: ''
    };
    
    // 重置 UI 元素
    document.getElementById('size').value = 250;
    document.getElementById('fgColor').value = '#000000';
    document.getElementById('bgColor').value = '#FFFFFF';
    document.getElementById('level').value = 'M';
    document.getElementById('enableLogo').checked = false;
    document.getElementById('logoOptions').classList.add('hidden');
    document.getElementById('enableTextDescription').checked = false;
    document.getElementById('textDescriptionOptions').classList.add('hidden');
    document.getElementById('textDescriptionInput').value = '';

    regenerateQRCode();
}

export function updateInputData(text, type) {
    qrOptions.inputText = text;
    qrOptions.inputType = type;
    console.log('更新后的 qrOptions:', JSON.stringify(qrOptions, null, 2));
}

console.log('customization.js 执行结束');