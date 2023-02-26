const nodeFetch = require('node-fetch-commonjs');
const fetch = nodeFetch.default;

/**
 * 合併url
 * @param  {...any} args relative urls
 * @return {string} url
 */
function joinUrl(...args) {
    const url = [];
    const query = [];
    let isQueryStart = false;

    for (const arg of args) {
        if (arg.startsWith('?')) {
            if (isQueryStart) {
                query.push(arg.replace(/^\?+/, ''));
                continue;
            }
            isQueryStart = true;
            query.push(arg);
        } else {
            if (isQueryStart) {
                query.push(arg);
            } else {
                url.push(arg.replace(/^\/+/, '').replace(/\/+$/, ''));
            }
        }
    }

    return url.join('/') + query.join('&');
}

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
        const url = joinUrl(this.baseURL, '/A01010000C-002150-013', `?limit=${this.limit}`);
        const res = await fetch(url, {});
        return await res.json();
    }

    // /**
    //  * 抓取詐騙LineID
    //  * @return {object}
    //  */
    // async getLineId() {
    //     const url = joinUrl(this.baseURL, '/A01010000C-001277-053', `?limit=${this.limit}`);
    //     const res = await fetch(url.toString(), {});
    //     return await res.json();
    // }
    // 目前用不到

    /**
     * 抓取詐騙LineID
     * @return {object}
     */
    async getNews() {
        const url = joinUrl(this.baseURL, '/A01010000C-000962-156', `?limit=${this.limit}`);
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

/**
 * google safe browsing 封裝類別，look up only
 */
class GoogleSafeBrowsingAPI {
    baseURL = new URL('https://safebrowsing.googleapis.com/v4/threatMatches:find');

    body = {
        'client': {
            'clientId': 'no-phishing-url',
            'clientVersion': '1.5.2',
        },
        'threatInfo': {
            'threatTypes': ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION',],
            'platformTypes': ['ALL_PLATFORMS',],
            'threatEntryTypes': ['URL',],
            'threatEntries': [
                { 'url': '', },
            ],
        },
    };

    /**
     * Constructor of GoogleSafeBrowsingAPI
     * @param {string} apiKey
     */
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL.searchParams.append('key', this.apiKey);
        this.lookUpUrl = this.baseURL.href;
    }

    /**
     * 找尋url結果
     * @param {string} url
     */
    async lookUp(url) {
        this.body.threatInfo.threatEntries[0].url = url;
        const res = await fetch(this.lookUpUrl, {
            body: JSON.stringify(this.body),
            headers: {
                'content-type': 'application/json',
            },
            method: 'POST',
        });

        return await res.json();
    }
}

/**
 * PhishStats API封裝類別，eq url only
 */
class PhishStatsAPI {
    baseURL = new URL('https://phishstats.info:2096/api/phishing');

    /**
     * 找尋url結果
     * @param {string} targetUrl
     */
    async lookUp(targetUrl) {
        this.baseURL.searchParams.append('_where', `(url,eq,${targetUrl})`);
        const url = this.baseURL.href;
        const res = await fetch(url);
        return await res.json();
    }
}

/**
 * 抓取google safe browsing、phishstats等網站資料的封裝類別
 */
class PhishingUrlAPI {
    /**
     * Constructor
     */
    constructor() {
        this.googleAPI = new GoogleSafeBrowsingAPI(process.env.SAFEBROWSE_API_KEY);
        this.PhishStatsAPI = new PhishStatsAPI();
    }

    /**
     * 從兩個資料庫檢測是不是釣魚網站
     * @param {string} url
     * @return {boolean} is phishing website
     */
    async isPhishUrl(url) {
        const googleRes = await this.googleAPI.lookUp(url);
        // const phishStatRes = await this.PhishStatsAPI.lookUp(url);

        // TODO: 實作PhishStat
        // 因為現在不知道為啥不讓我爬

        if (!googleRes.matches) {
            return false;
        } else {
            return true;
        }
    }
}

module.exports = {
    ScamDataAPI: ScamDataAPI,
    GoogleSafeBrowsingAPI: GoogleSafeBrowsingAPI,
    PhishStatsAPI: PhishStatsAPI,
    PhishingUrlAPI: PhishingUrlAPI,
};
