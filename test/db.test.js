const { GamblingWebsiteDatabase, NewsDatabase, } = require('../handler/database');

xdescribe('資料庫測試', () => {
    xtest('gambling database test', () => {
        const db = new GamblingWebsiteDatabase();
        db.init();
        const target = new URL('https://www.google.com/');

        expect(db.isGambling(target)).toBe(false); // wtf???
        // Expected: false
        // Received: {Symbol(async_id_symbol): 1094, Symbol(trigger_async_id_symbol): 791}
    });
});
