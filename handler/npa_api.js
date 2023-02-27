const nodeFetch = require('node-fetch-commonjs');
const fetch = nodeFetch.default;

/**
 * 抓取警政署資料類別
 */
class ScamDataAPI {
    baseURL = 'https://od.moi.gov.tw/api/v1/rest/datastore/';
    limit = 100000;

    /**
     * 抓取博弈網站資料
     * @return {object}
     */
    async getGambling() {
        const url = new URL('/A01010000C-002150-013', baseURL);
        url.searchParams.append('limit', `${this.limit}`);
        const res = await fetch(url.href, {});
        return await res.json();
    }

    /**
     * 抓取詐騙防治新聞
     * @return {object}
     */
    async getNews() {
        const url = new URL('/A01010000C-000962-156', baseURL);
        url.searchParams.append('limit', `${this.limit}`);
        const res = await fetch(url.toString(), {});
        return await res.json();
    }

    /**
     * 從原資料回傳網站紀錄
     * 資料必須正確回傳(data.success = true)
     * @param {Object} data
     * @return {Object}
     */
    parse(data) {
        if (!data) return;

        if (data.success) {
            return data.result.records;
        }
    }
}

module.exports = {
    ScamDataAPI: ScamDataAPI,
};
