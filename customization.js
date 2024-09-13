// 全局数据结构
let qrOptions = {
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

const MAX_QR_SIZE = 250; // 或者您认为合适的最大值

export function initCustomization() {
    const sizeInput = document.getElementById('size');
    const sizeValue = document.getElementById('sizeValue');
    const fgColorInput = document.getElementById('fgColor');
    const bgColorInput = document.getElementById('bgColor');
    const levelSelect = document.getElementById('level');
    const resetBtn = document.getElementById('resetBtn');
    const logoUpload = document.getElementById('logoUpload');
    const logoShapeInputs = document.querySelectorAll('input[name="logoShape"]');

    const enableTextDescriptionCheckbox = document.getElementById('enableTextDescription');
    const textDescriptionOptionsDiv = document.getElementById('textDescriptionOptions');
    const textDescriptionInput = document.getElementById('textDescriptionInput');
    const textDescriptionCharCount = document.getElementById('textDescriptionCharCount');

    // 检查元素是否存在
    if (!sizeInput || !sizeValue || !fgColorInput || !bgColorInput || !levelSelect || !resetBtn || !logoUpload) {
        console.error('Some elements are missing in the DOM');
        return; // 如果缺少元素，提前退出函数
    }

    // 设置 size 输入的最大值
    sizeInput.max = MAX_QR_SIZE;

    [sizeInput, fgColorInput, bgColorInput, levelSelect].forEach(element => {
        element.addEventListener('change', updateOptions);
    });

    sizeInput.addEventListener('input', () => {
        const size = Math.min(parseInt(sizeInput.value), MAX_QR_SIZE);
        sizeValue.textContent = size;
        updateOptions();
    });

    logoUpload.addEventListener('change', handleLogoUpload);

    resetBtn.addEventListener('click', resetCustomOptions);

    // 初始化选项值
    updateOptions();

    logoShapeInputs.forEach(input => {
        input.addEventListener('change', updateOptions);
    });

    const enableLogoCheckbox = document.getElementById('enableLogo');
    const logoOptionsDiv = document.getElementById('logoOptions');

    // 添加这个事件监听器来控制 Logo 设置控件的显示和隐藏
    enableLogoCheckbox.addEventListener('change', () => {
        logoOptionsDiv.classList.toggle('hidden', !enableLogoCheckbox.checked);
        updateOptions();
    });

    enableTextDescriptionCheckbox.addEventListener('change', () => {
        textDescriptionOptionsDiv.classList.toggle('hidden', !enableTextDescriptionCheckbox.checked);
        updateOptions();
    });

    textDescriptionInput.addEventListener('input', () => {
        const currentLength = textDescriptionInput.value.length;
        textDescriptionCharCount.textContent = `${currentLength}/15`;
        updateOptions();
    });
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            qrOptions.logo = e.target.result;
            updateOptions();
        };
        reader.readAsDataURL(file);
    }
}

function updateOptions() {
    console.log('更新选项开始');
    qrOptions.size = Math.min(parseInt(document.getElementById('size').value), MAX_QR_SIZE);
    qrOptions.fgColor = document.getElementById('fgColor').value;
    qrOptions.bgColor = document.getElementById('bgColor').value;
    qrOptions.level = document.getElementById('level').value;
    qrOptions.margin = Math.floor(qrOptions.size * 0.1);
    qrOptions.logoEnabled = document.getElementById('enableLogo').checked;
    qrOptions.logoShape = document.querySelector('input[name="logoShape"]:checked').value;

    if (!qrOptions.logoEnabled) {
        qrOptions.logo = null;
    }

    qrOptions.textDescriptionEnabled = document.getElementById('enableTextDescription').checked;
    qrOptions.textDescription = document.getElementById('textDescriptionInput').value.trim();

    console.log('更新后的 qrOptions:', JSON.stringify(qrOptions, null, 2));

    regenerateQRCode();
    console.log('更新选项结束');
}

function resetCustomOptions() {
    document.getElementById('size').value = '250';
    document.getElementById('sizeValue').textContent = '250';
    document.getElementById('fgColor').value = '#000000';
    document.getElementById('bgColor').value = '#FFFFFF';
    document.getElementById('level').value = 'M';
    document.getElementById('logoUpload').value = '';
    document.querySelector('input[name="logoShape"][value="square"]').checked = true;
    qrOptions.logo = null;
    qrOptions.logoShape = 'square';
    qrOptions.logoEnabled = false;
    qrOptions.logo = null;
    qrOptions.logoShape = 'square';

    document.getElementById('enableLogo').checked = false;
    document.getElementById('logoOptions').classList.add('hidden');
    document.getElementById('logoUpload').value = '';
    document.querySelector('input[name="logoShape"][value="square"]').checked = true;

    document.getElementById('enableTextDescription').checked = false;
    document.getElementById('textDescriptionOptions').classList.add('hidden');
    document.getElementById('textDescriptionInput').value = '';
    document.getElementById('textDescriptionCharCount').textContent = '0/15';

    qrOptions.textDescriptionEnabled = false;
    qrOptions.textDescription = '';

    updateOptions();
}

function regenerateQRCode() {
    if (qrOptions.inputText) {
        // 导入 qrGenerator.js 中的函数并重新生成二维码
        import('./qrGenerator.js').then(module => {
            module.generateQRCode(qrOptions.inputText, qrOptions.inputType);
        });
    } else {
        console.log('没有找到有效的输入内容，无法重新生成二维码');
    }
}

export function updateInputData(text, type) {
    qrOptions.inputText = text;
    qrOptions.inputType = type;
}

export { qrOptions };