const { GamblingWebsiteDatabase, NewsDatabase, } = require('../handler/database');

xdescribe('資料庫測試', () => {
    xtest('取得最新新聞', () => {
        const db = new NewsDatabase();
        db._db.count({}, async (err, count) => {
            expect(count).toBe(85);

            let news = await db.find({ 編號: `${count}`, });

            expect(news.length).toBeGreaterThan(0);

            if (news.length > 0) {
                news = news[0];
                console.log(`**${news['標題']}**  ${news['發佈時間']}\n\n${news['發佈內容']}`);
            }
        });
    });
});
