const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Loại bỏ toàn bộ HTML tag khỏi chuỗi đầu vào để chống XSS.
 * @param {string} str - Chuỗi cần làm sạch
 * @returns {string} Chuỗi đã được làm sạch
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    // ALLOWED_TAGS: [] => Xóa sạch mọi HTML tag, chỉ giữ lại text thuần
    return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] }).trim();
};

/**
 * Làm sạch một mảng các chuỗi (dùng cho labels)
 * @param {string[]} arr
 * @returns {string[]}
 */
const sanitizeArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => sanitizeString(item)).filter(item => item.length > 0);
};

module.exports = { sanitizeString, sanitizeArray };
