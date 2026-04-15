const fs = require('fs');
const PizZip = require('pizzip');

function getDocXml(filePath) {
  const content = fs.readFileSync(filePath);
  const zip = new PizZip(content);
  return zip.file('word/document.xml').asText();
}

function decodeXmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function encodeXmlEntities(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 从段落 XML 中提取纯文本
 * 只提取 <w:t>...</w:t> 标签内的文本内容
 */
function extractTextFromParagraph(pXml) {
  const parts = [];
  // 严格匹配 <w:t> 或 <w:t xml:space="preserve"> 的内容
  const regex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m;
  while ((m = regex.exec(pXml)) !== null) {
    parts.push(decodeXmlEntities(m[1]));
  }
  return parts.join('');
}

/**
 * 解析 docx 中的空白项占位符
 */
function parsePlaceholders(filePath, rule = 'underscore', customPattern = null) {
  const xml = getDocXml(filePath);
  const placeholders = [];
  let index = 0;

  // 逐段落提取纯文本
  const pRegex = /<w:p\b[\s\S]*?<\/w:p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const text = extractTextFromParagraph(pMatch[0]);
    if (!text) continue;

    if (rule === 'underscore') {
      // 匹配中文/英文标签后跟连续下划线
      // 如 "单位名称：________________________" → label="单位名称："
      const fillRegex = /([\u4e00-\u9fa5a-zA-Z0-9（）()：:]+)_{3,}/g;
      let m;
      while ((m = fillRegex.exec(text)) !== null) {
        let label = m[1];
        // 只保留最后一个有意义的标签词（去掉前面的长文本）
        // 如 "甲方（用人单位）单位名称：" 中取 "单位名称："
        const labelMatch = label.match(/([\u4e00-\u9fa5a-zA-Z0-9（）()]+[：:]?)$/);
        if (labelMatch) {
          label = labelMatch[1];
        }
        placeholders.push({
          key: `placeholder_${index}`,
          label,
          type: 'underscore',
          index
        });
        index++;
      }
    } else if (rule === 'custom' && customPattern) {
      const regex = new RegExp(customPattern, 'g');
      let m;
      while ((m = regex.exec(text)) !== null) {
        placeholders.push({
          key: `placeholder_${index}`,
          label: m[1] || m[0],
          type: 'custom',
          index
        });
        index++;
      }
    }
  }

  return placeholders;
}

/**
 * 填充 docx 模板，将空白项替换为实际值（填入值带下划线格式）
 */
function fillDocument(templatePath, outputPath, fillData, rule = 'underscore', customPattern = null) {
  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml').asText();

  // 构建 label → value 映射
  const labelValueMap = {};
  for (const key of Object.keys(fillData)) {
    const entry = fillData[key];
    if (typeof entry === 'object' && entry.label && entry.value) {
      labelValueMap[entry.label] = entry.value;
    }
  }

  // 按段落处理
  const pRegex = /<w:p\b[\s\S]*?<\/w:p>/g;
  xml = xml.replace(pRegex, (pXml) => {
    // 提取段落内所有 <w:t> 的文本
    const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    const tParts = [];
    let tMatch;
    while ((tMatch = tRegex.exec(pXml)) !== null) {
      tParts.push(decodeXmlEntities(tMatch[1]));
    }
    if (tParts.length === 0) return pXml;

    const fullText = tParts.join('');

    // 检查此段落是否包含需要替换的占位符
    let hasMatch = false;
    if (rule === 'underscore') {
      hasMatch = /([\u4e00-\u9fa5a-zA-Z0-9（）()：:]+)_{3,}/g.test(fullText);
    } else if (rule === 'custom' && customPattern) {
      hasMatch = new RegExp(customPattern).test(fullText);
    }
    if (!hasMatch) return pXml;

    // 提取第一个 <w:r> 的 <w:rPr> 作为基础样式
    const rPrMatch = pXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
    const baseRPr = rPrMatch ? rPrMatch[0] : '<w:rPr></w:rPr>';

    // 构建带下划线的 rPr：在 baseRPr 的 </w:rPr> 前插入 <w:u w:val="single"/>
    let underlineRPr;
    if (baseRPr.includes('<w:u ')) {
      underlineRPr = baseRPr;
    } else {
      underlineRPr = baseRPr.replace('</w:rPr>', '<w:u w:val="single"/></w:rPr>');
    }

    // 将全文按占位符拆分成 segments: { text, underline }[]
    const segments = [];
    let lastIndex = 0;
    let replaced = false;

    if (rule === 'underscore') {
      const fillRegex = /([\u4e00-\u9fa5a-zA-Z0-9（）()：:]+)(_{3,})/g;
      let m;
      while ((m = fillRegex.exec(fullText)) !== null) {
        // m.index 到 m.index + rawLabel.length 是标签部分
        // 之后是下划线部分
        const beforeStart = lastIndex;
        const labelStart = m.index;
        const rawLabel = m[1];
        const underscores = m[2];

        // 标签之前的普通文本
        if (labelStart > beforeStart) {
          segments.push({ text: fullText.slice(beforeStart, labelStart), underline: false });
        }

        let label = rawLabel;
        const labelMatch = label.match(/([\u4e00-\u9fa5a-zA-Z0-9（）()]+[：:]?)$/);
        if (labelMatch) {
          label = labelMatch[1];
        }

        if (labelValueMap[label]) {
          replaced = true;
          // 标签文本保持原样
          segments.push({ text: rawLabel, underline: false });
          // 填入值前后各加两个空格，并加下划线
          segments.push({ text: `  ${labelValueMap[label]}  `, underline: true });
        } else {
          // 没有填入值，保留原样（标签+下划线）
          segments.push({ text: rawLabel + underscores, underline: false });
        }
        lastIndex = m.index + m[0].length;
      }
    } else if (rule === 'custom' && customPattern) {
      const fillRegex = new RegExp(customPattern, 'g');
      let m;
      while ((m = fillRegex.exec(fullText)) !== null) {
        if (m.index > lastIndex) {
          segments.push({ text: fullText.slice(lastIndex, m.index), underline: false });
        }
        const label = m[1] || m[0];
        if (labelValueMap[label]) {
          replaced = true;
          segments.push({ text: `  ${labelValueMap[label]}  `, underline: true });
        } else {
          segments.push({ text: m[0], underline: false });
        }
        lastIndex = m.index + m[0].length;
      }
    }

    if (!replaced) return pXml;

    // 剩余文本
    if (lastIndex < fullText.length) {
      segments.push({ text: fullText.slice(lastIndex), underline: false });
    }

    // 重建段落：保留 <w:pPr>，用 segments 生成新的 <w:r> 节点
    const pPrMatch = pXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    const pPr = pPrMatch ? pPrMatch[0] : '';

    // 提取 <w:p> 的属性（如 w14:paraId）
    const pTagMatch = pXml.match(/^<w:p([^>]*)>/);
    const pAttrs = pTagMatch ? pTagMatch[1] : '';

    const runs = segments.map(seg => {
      const rPr = seg.underline ? underlineRPr : baseRPr;
      return `<w:r>${rPr}<w:t xml:space="preserve">${encodeXmlEntities(seg.text)}</w:t></w:r>`;
    }).join('');

    return `<w:p${pAttrs}>${pPr}${runs}</w:p>`;
  });

  zip.file('word/document.xml', xml);
  const newContent = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, newContent);
}

module.exports = {
  parsePlaceholders,
  fillDocument
};
