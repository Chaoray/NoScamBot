const Datastore = require('nedb');
const path = require('path');
const { ScamDataAPI, } = require('./npa_api');

/**
 * Database類別原型
 */
class Database {
    _db = null;
    /**
     * 初始化資料庫
     */
    init() {}

    /**
     * 搜尋Promise封裝
     * @param {Object} param 搜尋參數
     * @return {Object} 結果
     */
    find(param) {
        return new Promise((resolve, reject) => {
            this._db.find(param, async (err, docs) => {
                if (err) return reject(err);

                resolve(docs);
            });
        });
    }
}


/**
 * 詐騙網站資料庫封裝類別
 */
class GamblingWebsiteDatabase extends Database {
    /**
     * 初始化類別
     */
    constructor() {
        super();

        this._db = new Datastore({
            filename: path.join(__dirname, '../db/websites.db'),
            autoload: true,
        });
    }

    /**
     * 初始化資料庫
     * @return {Promise<Object>} 資料庫初始化後的資料
     */
    init() {
        const api = new ScamDataAPI();
        return new Promise((resolve, reject) => {
            this._db.find({}, async (err, docs) => {
                if (err) return reject(err);

                if (docs.length == 0) {
                    let data = await api.getGambling();
                    data = api.parse(data);
                    this._db.insert(data, (err, docs) => {
                        resolve(docs);
                    });
                } else {
                    resolve(docs);
                }
            });
        });
    }

    /**
     * 看看是不是博弈網站
     * @param {URL} url
     * @return {boolean} isGambling?
     */
    async isGambling(url) {
        if (!(url instanceof URL)) return null;

        const doc = await this.find({ WEBURL: url.hostname, });
        if (doc.length > 0) {
            return true;
        } else {
            return false;
        }
    }
}

/**
 * 詐騙Line ID資料庫封裝類別
 */
class NewsDatabase extends Database {
    /**
     * 初始化類別
     */
    constructor() {
        super();

        this._db = new Datastore({
            filename: path.join(__dirname, '../db/news.db'),
            autoload: true,
        });
    }

    /**
     * 初始化資料庫
     * @return {Promise<Object>} 資料庫初始化後的資料
     */
    init() {
        const api = new ScamDataAPI();
        return new Promise((resolve, reject) => {
            this._db.find({}, async (err, docs) => {
                if (err) return reject(err);

                if (docs.length == 0) {
                    let data = await api.getNews();
                    data = api.parse(data);
                    this._db.insert(data, (err, docs) => {
                        resolve(docs);
                    });
                } else {
                    resolve(docs);
                }
            });
        });
    }
}

// TODO: 類別相似度過高
// [建議] 高度相似部分可以轉成同一類別

// TODO: 自動更新資料庫?
// 1. 清空
// 2. 重新抓資料

module.exports = {
    GamblingWebsiteDatabase: GamblingWebsiteDatabase,
    NewsDatabase: NewsDatabase,
};
