const { NewsDatabase, } = require('../handler/database');

const db = new NewsDatabase();
db.init();

module.exports = {
    name: 'news',
    description: '取得最新防詐騙消息',
    async execute(message, params) {
        db._db.count({}, async (err, count) => {
            let news = await db.find({ 編號: `${count}`, });
            if (news.length > 0) {
                news = news[0];
                await message.reply(`**${news['標題']}**  ${news['發佈時間']}\n\n${news['發佈內容']}`);
            }
        });
    },
};
