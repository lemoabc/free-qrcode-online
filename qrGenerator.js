import { qrOptions } from './customization.js';
import { showToast } from './ui.js';
import { isValidUrl } from './utils.js';
import { getTranslation } from './i18n.js';

export async function generateQRCode(text, inputType) {
    console.log('generateQRCode 函数开始执行');
    console.log('输入文本:', text, '输入类型:', inputType);
    console.log('当前 qrOptions:', JSON.stringify(qrOptions, null, 2));

    if (!text) {
        showToast(getTranslation('pleaseEnterContentOrSelectFile'), 'error');
        return;
    }

    const qrcodeDiv = document.getElementById('qrcode');
    const qrDescription = document.getElementById('qrDescription');

    qrcodeDiv.innerHTML = '';

    const qr = qrcode(0, qrOptions.level);
    
    try {
        if (inputType === 'url' && isValidUrl(text)) {
            qr.addData(text);
        } else {
            const utf8Text = unescape(encodeURIComponent(text));
            qr.addData(utf8Text, 'Byte');
        }
        qr.make();

        const cellSize = Math.floor((qrOptions.size - 2 * qrOptions.margin) / qr.getModuleCount());

        const svgTag = qr.createSvgTag({
            cellSize: cellSize,
            margin: qrOptions.margin,
            scalable: true
        });

        qrcodeDiv.innerHTML = svgTag;
        let svgElement = qrcodeDiv.querySelector('svg');

        if (svgElement) {
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            svgElement.setAttribute('viewBox', `0 0 ${qrOptions.size} ${qrOptions.size}`);
            svgElement.style.display = 'block';

            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = `${qrOptions.size}px`;

            const rectElement = svgElement.querySelector('rect');
            const pathElement = svgElement.querySelector('path');

            if (rectElement) {
                rectElement.setAttribute('fill', qrOptions.bgColor);
            }

            if (pathElement) {
                pathElement.setAttribute('fill', qrOptions.fgColor);
            }

            // 添加 Logo
            if (qrOptions.logoEnabled && qrOptions.logo) {
                const logoSize = Math.floor(qrOptions.size / 5);
                const logoX = Math.floor((qrOptions.size - logoSize) / 2);
                const logoY = Math.floor((qrOptions.size - logoSize) / 2);

                const logoGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                logoGroup.setAttribute('transform', `translate(${logoX}, ${logoY})`);

                const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                clipPath.setAttribute("id", "logoClip");

                let clipShape;
                if (qrOptions.logoShape === 'circle') {
                    clipShape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    clipShape.setAttribute("cx", logoSize / 2);
                    clipShape.setAttribute("cy", logoSize / 2);
                    clipShape.setAttribute("r", logoSize / 2);
                } else if (qrOptions.logoShape === 'rounded') {
                    clipShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    clipShape.setAttribute("x", 0);
                    clipShape.setAttribute("y", 0);
                    clipShape.setAttribute("width", logoSize);
                    clipShape.setAttribute("height", logoSize);
                    clipShape.setAttribute("rx", "10");
                    clipShape.setAttribute("ry", "10");
                } else {
                    clipShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    clipShape.setAttribute("x", 0);
                    clipShape.setAttribute("y", 0);
                    clipShape.setAttribute("width", logoSize);
                    clipShape.setAttribute("height", logoSize);
                }

                clipPath.appendChild(clipShape);
                svgElement.appendChild(clipPath);

                // 添加与背景色相同的边框
                const logoBorder = clipShape.cloneNode(true);
                logoBorder.setAttribute("fill", "none");
                logoBorder.setAttribute("stroke", qrOptions.bgColor);
                logoBorder.setAttribute("stroke-width", "4"); // 2px 边框，但因为边框会向内外各延伸 1px，所以设置为 4
                logoGroup.appendChild(logoBorder);

                const logoImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
                logoImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", qrOptions.logo);
                logoImage.setAttribute("width", logoSize);
                logoImage.setAttribute("height", logoSize);
                logoImage.setAttribute("clip-path", "url(#logoClip)");

                logoGroup.appendChild(logoImage);
                svgElement.appendChild(logoGroup);

                console.log('Logo 已添加到 QR 码，带有背景色边框');
            }

            // 添加文字描述（如果启用）
            if (qrOptions.textDescriptionEnabled && qrOptions.textDescription) {
                const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textElement.setAttribute("x", qrOptions.size / 2);
                textElement.setAttribute("y", qrOptions.size + 20); // 将文字放在 QR 码下方
                textElement.setAttribute("text-anchor", "middle");
                textElement.setAttribute("fill", qrOptions.fgColor);
                textElement.setAttribute("font-size", "14");
                textElement.textContent = qrOptions.textDescription;
                svgElement.appendChild(textElement);

                // 调整 SVG 的 viewBox 以包含文字
                const newHeight = qrOptions.size + 40; // 为文字留出空间
                svgElement.setAttribute('viewBox', `0 0 ${qrOptions.size} ${newHeight}`);
                svgElement.setAttribute('height', newHeight);

                console.log('文字描述已添加到 QR 码');
            }
        }

        qrDescription.textContent = inputType === 'url' ? getTranslation('generatedUrlQRCode') : 
                                    inputType === 'file' ? getTranslation('generatedFileQRCode') : 
                                    getTranslation('generatedTextQRCode');
        
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('shareBtn').disabled = false;

        console.log('二维码生成完成');
        showToast(getTranslation('qrCodeGeneratedSuccess'), 'success');
    } catch (error) {
        console.error('生成二维码时出错:', error);
        showToast(getTranslation('qrCodeGenerationFailed'), 'error');
    }
}

console.log('qrGenerator.js 执行结束');
