const { CheckIsPhishingAPI, } = require('../handler/phishing_api');

const api = new CheckIsPhishingAPI();

module.exports = {
    name: 'check',
    description: '查看網址是否有問題\nUsage: check [url]',
    async execute(message, params) {
        params = params.split(' ');

        if (params.length[0] === '') {
            await message.reply('參數缺失: url');
            return;
        }

        let url = params[0];
        url = isValidUrl(url);
        if (!url) {
            message.reply('網址錯誤');
            return;
        }

        const res = await api.isPhishUrl(url);
        if (res) {
            message.reply('**是釣魚網站!**');
            return;
        }

        message.reply('沒問題~');
    },
};

/**
 * Check is URL valid.
 * @param {string} string url
 * @return {null|URL}
 */
function isValidUrl(string) {
    try {
        return new URL(string);
    } catch (err) {
        return null;
    }
}
