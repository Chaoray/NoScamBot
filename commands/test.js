const { GamblingWebsiteDatabase, } = require('../handler/database');
const { PhishingUrlAPI, } = require('../handler/api');

const db = new GamblingWebsiteDatabase();
db.init();

const api = new PhishingUrlAPI();

module.exports = {
    name: 'test',
    description: '查看網址是否有問題\nUsage: test [url]',
    async execute(message, params) {
        params = params.split(' ');

        if (params.length[0] === '') {
            await message.reply('參數缺失: url');
            return;
        }

        let url = params[0];
        url = isValidUrl(url);
        if (url) {
            if (await db.isGambling(url.href)) {
                message.reply('**是博弈網站!**');
                return;
            }
        } else {
            message.reply('網址錯誤');
            return;
        }

        if (!api.isPhishUrl(url.href)) {
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
