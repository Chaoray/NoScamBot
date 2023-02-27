const { Events, } = require('discord.js');

const { CheckIsPhishingAPI, } = require('../handler/phishing_api');
const api = new CheckIsPhishingAPI();

const commandPrefix = process.env.PREFIX;

const UrlRegex = /((http|ftp|https):\/\/)?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.id === message.client.user.id) return;

        const content = message.content;
        if (content.startsWith(commandPrefix)) {
            const firstSpace = content.indexOf(' ');
            const commandName = content.slice(commandPrefix.length, firstSpace > 0 ? firstSpace : content.length);
            const commandList = message.client.messageCommands;

            const command = commandList.get(commandName);
            if (!command) return;

            if (!command.execute) return;

            let commandParams = '';
            if (firstSpace > 0) {
                commandParams = content.slice(firstSpace, content.length).trim();
            }

            try {
                await command.execute(message, commandParams);
            } catch (err) {
                console.error(err);
                message.reply('Error');
            }
        }

        let urls = message.content.match(UrlRegex);
        urls = urls ? urls : [];
        for (const url of urls) {
            const target = new URL(url);

            if (await api.isPhishUrl(target)) {
                message.reply('**內含釣魚網站!**');
                break;
            }
        }
    },
};

// TODO: 做個參數產生器吧....
// 管理還要轉換甚麼的太麻煩了
