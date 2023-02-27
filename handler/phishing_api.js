const zlib = require('zlib');
const tar = require('tar-stream');
const nodeFetch = require('node-fetch-commonjs');
const fetch = nodeFetch.default;

/**
 * API interface
 * @class API
 */
class API {
    /**
     * 找尋結果
     * @param {URL} url
     * @return {object} fetch data
     * @return {null} url is not instanceof URL
     */
    async lookUp(url) { }
}

/**
 * google safe browsing 封裝類別，look up only
 * @class GoogleSafeBrowsingAPI
 * @extends {API}
 */
class GoogleSafeBrowsingAPI extends API {
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
        super();

        this.apiKey = apiKey;
        this.baseURL.searchParams.append('key', this.apiKey);
        this.lookUpUrl = this.baseURL.href;
    }

    /**
     * 找尋url結果
     * @param {URL} url
     * @return {object} fetch data
     * @return {null} url is not instanceof URL
     */
    async lookUp(url) {
        if (!(url instanceof URL)) return null;

        this.body.threatInfo.threatEntries[0].url = url.href;
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
 * @class PhishingDatabaseAPI
 * @extends {API}
 */
class PhishStatsAPI extends API {
    baseURL = new URL('https://phishstats.info:2096/api/phishing');

    /**
     * 找尋url結果
     * @param {URL} url
     * @return {object} fetch data
     * @return {null} url is not instanceof URL
     */
    async lookUp(url) {
        if (!(url instanceof URL)) return null;

        this.baseURL.searchParams.append('_where', `(domain,like,${url.hostname})`);
        const fetchUrl = this.baseURL.href;
        const res = await fetch(fetchUrl);
        return await res.json();
    }
}

/**
 * Phishing.Database封裝類別
 * @class PhishingDatabaseAPI
 * @extends {API}
 */
class PhishingDatabaseAPI extends API {
    static domains = new Set();

    /**
     * constructor
     */
    constructor() {
        super();
    }

    /**
     * 更新資料庫
     * @return {Promise}
     */
    update() {
        return new Promise((resolve, reject) => {
            PhishingDatabaseAPI.domains.clear();

            const extract = tar.extract();
            const chunks = [];

            extract.on('entry', (header, stream, next) => {
                stream.on('data', (chunk) => {
                    if (header.name.includes('ALL-phishing-domains.txt')) {
                        chunks.push(chunk);
                    }
                });

                stream.on('end', () => {
                    let domainData = Buffer.concat(chunks).toString('utf8');
                    domainData = domainData.split('\n');
                    PhishingDatabaseAPI.domains = new Set(domainData);
                    next();
                });

                stream.resume();
            });

            fetch('https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/ALL-phishing-domains.tar.gz')
                .then((res) => {
                    res.body.pipe(zlib.createGunzip()).pipe(extract);

                    extract.on('finish', () => {
                        resolve();
                    });
                }).catch((err) => reject(err));
        });
    }

    /**
     * 找尋結果
     * @param {URL} url
     * @return {boolean} is phishing domain
     * @return {null} url is not instanceof URL
     */
    lookUp(url) {
        if (!(url instanceof URL)) return null;

        const result = PhishingDatabaseAPI.domains.has(url.hostname);

        return result;
    }
}

/**
 * 抓取phishing database等網站資料的封裝類別
 */
class CheckIsPhishingAPI {
    /**
     * Constructor
     */
    constructor() {
        this.googleAPI = new GoogleSafeBrowsingAPI(process.env.SAFEBROWSE_API_KEY);
        this.phishingDatabaseAPI = new PhishingDatabaseAPI();
        this.phishStatsAPI = new PhishStatsAPI();
    }

    /**
     * 初始化Phishing.Database
     */
    async init() {
        await this.phishingDatabaseAPI.update();
    }

    /**
     * 從資料庫檢測是不是釣魚網站
     * @param {URL} url
     * @return {boolean} is phishing website
     * @return {null} url is not instanceof URL
     */
    async isPhishUrl(url) {
        if (!(url instanceof URL)) return null;

        const googleRes = await this.googleAPI.lookUp(url);
        const phishStatRes = await this.phishStatsAPI.lookUp(url);
        const dbRes = this.phishingDatabaseAPI.lookUp(url);

        if (googleRes.matches) {
            return true;
        }

        if (phishStatRes.length > 0) {
            return true;
        }

        if (dbRes) {
            return true;
        }

        return false;
    }
}

module.exports = {
    GoogleSafeBrowsingAPI: GoogleSafeBrowsingAPI,
    PhishStatsAPI: PhishStatsAPI,
    PhishingDatabaseAPI: PhishingDatabaseAPI,
    CheckIsPhishingAPI: CheckIsPhishingAPI,
};
