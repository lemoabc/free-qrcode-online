import { qrOptions } from './customization.js';
import { showToast } from './ui.js';
import { isValidUrl } from './utils.js';

export async function generateQRCode(text, inputType) {
    console.log('开始生成二维码，输入类型:', inputType);
    console.log('当前 qrOptions:', JSON.stringify(qrOptions, null, 2));

    if (!text) {
        showToast('请输入内容或选择文件');
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
                const logoSize = Math.floor(qrOptions.size / 5); // 稍微增大 logo 尺寸
                const logoX = Math.floor((qrOptions.size - logoSize) / 2);
                const logoY = Math.floor((qrOptions.size - logoSize) / 2);

                console.log('Logo 位置和大小:', {
                    size: logoSize,
                    x: logoX,
                    y: logoY,
                    qrSize: qrOptions.size
                });

                const logoGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                logoGroup.setAttribute('transform', `translate(${logoX}, ${logoY})`);

                // 创建一个剪切路径
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

                // 添加一个与背景色相同的边框
                const logoBorder = clipShape.cloneNode(true);
                logoBorder.setAttribute("fill", "none");
                logoBorder.setAttribute("stroke", qrOptions.bgColor);
                logoBorder.setAttribute("stroke-width", "4");
                logoGroup.appendChild(logoBorder);

                const logoImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
                logoImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", qrOptions.logo);
                logoImage.setAttribute("width", logoSize);
                logoImage.setAttribute("height", logoSize);
                logoImage.setAttribute("x", 0);
                logoImage.setAttribute("y", 0);
                logoImage.setAttribute("clip-path", "url(#logoClip)");

                logoGroup.appendChild(logoImage);
                svgElement.appendChild(logoGroup);
            }
        }

        // 在 SVG 生成完成后，添加文字描述
        if (qrOptions.textDescriptionEnabled && qrOptions.textDescription) {
            const textPadding = 20; // 文字和二维码之间的固定间距
            const fontSize = 14;
            const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElement.setAttribute("text-anchor", "middle");
            textElement.setAttribute("font-size", fontSize);
            textElement.setAttribute("fill", qrOptions.fgColor);
            textElement.setAttribute("x", "50%");

            const textY = qrOptions.size + textPadding;
            const viewBoxHeight = qrOptions.size + textPadding + fontSize;

            textElement.setAttribute("y", textY);
            textElement.textContent = qrOptions.textDescription;

            // 创建一个新的 SVG 元素来包含原始的二维码和文字描述
            const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            newSvg.setAttribute("width", "100%");
            newSvg.setAttribute("height", "100%");
            newSvg.setAttribute("viewBox", `0 0 ${qrOptions.size} ${viewBoxHeight}`);
            newSvg.style.display = "block";

            // 将原始的 SVG 内容移动到新的 SVG 中
            while (svgElement.firstChild) {
                newSvg.appendChild(svgElement.firstChild);
            }

            // 添加文字元素
            newSvg.appendChild(textElement);

            // 替换原始的 SVG 元素
            svgElement.parentNode.replaceChild(newSvg, svgElement);
            svgElement = newSvg;

            console.log('文字描述已添加');
            console.log('SVG viewBox:', svgElement.getAttribute('viewBox'));
        }

        qrDescription.textContent = inputType === 'url' ? '生成的URL二维码' : 
                                    inputType === 'file' ? '生成的文件二维码' : '生成的文本二维码';
        
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('shareBtn').disabled = false;

        showToast('二维码生成成功', 'success');
    } catch (error) {
        console.error('生成二维码时出错:', error);
        showToast('生成二维码失败，请重试', 'error');
    }
}
