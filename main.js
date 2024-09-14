import { generateQRCode } from './qrGenerator.js';
import { initCustomization, updateInputData, qrOptions } from './customization.js';
import { initUI, showToast } from './ui.js';
import { setLanguage, getTranslation } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 已加载');
    const generateBtn = document.getElementById('generateBtn');
    console.log('生成按钮元素:', generateBtn);

    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const textTab = document.getElementById('textTab');
    const urlTab = document.getElementById('urlTab');
    const fileTab = document.getElementById('fileTab');
    const textInputContainer = document.getElementById('textInputContainer');
    const urlInputContainer = document.getElementById('urlInputContainer');
    const fileInputContainer = document.getElementById('fileInputContainer');
    const clearTextBtn = document.getElementById('clearTextBtn');
    const clearUrlBtn = document.getElementById('clearUrlBtn');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const textInput = document.getElementById('textInput');
    const urlInput = document.getElementById('urlInput');
    const fileInput = document.getElementById('fileInput');
    const charCount = document.getElementById('charCount');
    const languageButton = document.getElementById('languageButton');
    const languageOptions = document.getElementById('languageOptions');
    let isMenuOpen = false;

    languageButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        languageOptions.classList.toggle('hidden', !isMenuOpen);
    });

    languageOptions.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.tagName === 'A') {
            const selectedLanguage = e.target.getAttribute('data-lang');
            setLanguage(selectedLanguage);
            languageButton.querySelector('span').textContent = e.target.textContent;
            isMenuOpen = false;
            languageOptions.classList.add('hidden');
        }
    });

    document.addEventListener('click', () => {
        if (isMenuOpen) {
            isMenuOpen = false;
            languageOptions.classList.add('hidden');
        }
    });

    // 初始化语言
    setLanguage('en');

    generateBtn.addEventListener('click', async () => {
        console.log('生成按钮被点击');
        try {
            const { text, inputType } = getInputContent();
            if (text) {
                updateInputData(text, inputType); // 更新全局数据
                console.log('生成二维码前的 qrOptions:', JSON.stringify(qrOptions, null, 2));
                await generateQRCode(text, inputType);
                console.log('二维码生成完成');
                clearInputs();
            } else {
                showToast(getTranslation('pleaseEnterContentOrSelectFile'), 'error');
            }
        } catch (error) {
            console.error('生成二维码时出错:', error);
            showToast(getTranslation('failedToGenerateQRCode'), 'error');
        }
    });

    // 添加下载按钮的事件监听器
    downloadBtn.addEventListener('click', () => {
        showFormatDialog();
    });

    // 添加分享按钮的事件监听器
    shareBtn.addEventListener('click', async () => {
        await shareQRCode();
    });

    initCustomization();
    initUI();

    // 初始化选项卡
    [textTab, urlTab, fileTab].forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.id));
    });

    function switchTab(tabId) {
        console.log('Switching to tab:', tabId); // 添加日志

        // 重置所有选项卡和输入容器
        [textTab, urlTab, fileTab].forEach(tab => {
            tab.classList.remove('text-blue-600', 'bg-white', 'border-b-2', 'border-blue-600');
            tab.classList.add('text-gray-500');
        });
        [textInputContainer, urlInputContainer, fileInputContainer].forEach(container => {
            container.classList.add('hidden');
        });

        // 激活选中的选项卡和显示对应的输入容器
        const selectedTab = document.getElementById(tabId);
        selectedTab.classList.remove('text-gray-500');
        selectedTab.classList.add('text-blue-600', 'bg-white', 'border-b-2', 'border-blue-600');

        switch (tabId) {
            case 'textTab':
                textInputContainer.classList.remove('hidden');
                break;
            case 'urlTab':
                urlInputContainer.classList.remove('hidden');
                break;
            case 'fileTab':
                fileInputContainer.classList.remove('hidden');
                break;
        }

        console.log('Tab switched, current state:', {
            textTabClasses: textTab.className,
            urlTabClasses: urlTab.className,
            fileTabClasses: fileTab.className,
            textInputContainerClasses: textInputContainer.className,
            urlInputContainerClasses: urlInputContainer.className,
            fileInputContainerClasses: fileInputContainer.className
        });
    }

    // 添加清除按钮的功能
    clearTextBtn.addEventListener('click', () => {
        textInput.value = '';
        updateCharCount();
    });

    clearUrlBtn.addEventListener('click', () => {
        urlInput.value = '';
    });

    clearFileBtn.addEventListener('click', () => {
        fileInput.value = '';
    });

    function clearInputs() {
        textInput.value = '';
        urlInput.value = '';
        fileInput.value = '';
        updateCharCount();
    }

    function updateCharCount() {
        const currentLength = textInput.value.length;
        charCount.textContent = `${currentLength}/255`;
    }

    function showFormatDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 relative">
                <h3 class="text-lg font-semibold mb-4">${getTranslation('selectDownloadFormat')}</h3>
                <div class="space-y-2">
                    <button class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" data-format="png">PNG</button>
                    <button class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" data-format="svg">SVG</button>
                    <button class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" data-format="jpg">JPG</button>
                </div>
                <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" id="closeDialogBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(dialog);

        function closeDialog() {
            document.body.removeChild(dialog);
        }

        dialog.querySelectorAll('button[data-format]').forEach(button => {
            button.addEventListener('click', () => {
                const format = button.getAttribute('data-format');
                downloadQRCode(format);
                closeDialog();
            });
        });

        // 添加关闭按钮事件监听器
        const closeBtn = dialog.querySelector('#closeDialogBtn');
        closeBtn.addEventListener('click', closeDialog);

        // 添加 ESC 键监听器
        function handleEscKey(event) {
            if (event.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', handleEscKey);
            }
        }
        document.addEventListener('keydown', handleEscKey);

        // 点击对话框外部区域关闭对话框
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                closeDialog();
            }
        });
    }

    function downloadQRCode(format) {
        const svg = document.querySelector('#qrcode svg');
        if (!svg) {
            showToast(getTranslation('pleaseGenerateQRCodeFirst'), 'error');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            // 设置一个固定的大小，比如 1000x1000 像素
            const size = 1000;
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(img, 0, 0, size, size);
            
            let dataUrl;
            let fileName;
            
            switch(format) {
                case 'png':
                    dataUrl = canvas.toDataURL('image/png');
                    fileName = `${getTranslation('qrCode')}.png`;
                    break;
                case 'jpg':
                    dataUrl = canvas.toDataURL('image/jpeg');
                    fileName = `${getTranslation('qrCode')}.jpg`;
                    break;
                case 'svg':
                    // 对于 SVG，我们需要修改原始 SVG 数据
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
                    const svgElement = svgDoc.documentElement;
                    svgElement.setAttribute('width', size);
                    svgElement.setAttribute('height', size);
                    const serializer = new XMLSerializer();
                    const modifiedSvgData = serializer.serializeToString(svgElement);
                    dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(modifiedSvgData)));
                    fileName = `${getTranslation('qrCode')}.svg`;
                    break;
            }

            const downloadLink = document.createElement('a');
            downloadLink.download = fileName;
            downloadLink.href = dataUrl;
            downloadLink.click();
            showToast(`${getTranslation('qrCodeDownloadedAs')}${format.toUpperCase()}`, 'success');
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    async function shareQRCode() {
        const shareBtn = document.getElementById('shareBtn');
        // const originalText = shareBtn.textContent;
        shareBtn.disabled = true;
        shareBtn.textContent = getTranslation('sharing');
        try {
            const svg = document.querySelector('#qrcode svg');
            if (!svg) {
                throw new Error('Please generate QR code first');
            }

            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const svgUrl = URL.createObjectURL(svgBlob);

            if (navigator.share) {
                await Promise.race([
                    navigator.share({
                        title: getTranslation('shareQRCode'),
                        text: getTranslation('thisIsMyGeneratedQRCode'),
                        files: [new File([svgBlob], `${getTranslation('qrCode')}.svg`, { type: 'image/svg+xml' })]
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Share operation timed out')), 10000))
                ]);
                showToast(getTranslation('qrCodeShared'), 'success');
            } else {
                await fallbackShare(svgUrl);
            }
        } catch (error) {
            console.error('分享失败:', error);
            showToast(getTranslation('shareFailed'), 'error');
        } finally {
            shareBtn.disabled = false;
            shareBtn.textContent = getTranslation('share');
        }
    }

    function fallbackShare(url) {
        navigator.clipboard.writeText(url).then(() => {
            showToast(getTranslation('qrCodeLinkCopiedToClipboard'), 'success');
        }).catch((error) => {
            console.error('复制失败:', error);
            showToast(getTranslation('copyFailed'), 'error');
        });
    }

    // 确保在页面加载时调用一次 updateCharCount
    updateCharCount();

    // 在文本输入时更新字符计数
    textInput.addEventListener('input', updateCharCount);

    // Ensure download and share buttons are enabled
    downloadBtn.disabled = false;
    shareBtn.disabled = false;

    setTimeout(() => {
        console.log('延迟检查 qrcodeDiv 的内容:', document.getElementById('qrcode').innerHTML);
        // console.log('延迟检查 qrcodeDiv 的样式:', window.getComputedStyle(document.getElementById('qrcode')));
    }, 100);
});

function getInputContent() {
    let text = '';
    let inputType = '';

    if (!document.getElementById('textInputContainer').classList.contains('hidden')) {
        text = document.getElementById('textInput').value.trim();
        inputType = 'text';
    } else if (!document.getElementById('urlInputContainer').classList.contains('hidden')) {
        text = document.getElementById('urlInput').value.trim();
        inputType = 'url';
    } else if (!document.getElementById('fileInputContainer').classList.contains('hidden')) {
        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length > 0) {
            text = `File: ${fileInput.files[0].name}`;
            inputType = 'file';
        }
    }

    return { text, inputType };
}

generateBtn.addEventListener('click', async () => {
    console.log('生成按钮点击后 qrcodeDiv 的内容:', document.getElementById('qrcode').innerHTML);
    console.log('生成按钮点击后 qrcodeDiv 的样式:', window.getComputedStyle(document.getElementById('qrcode')));
});