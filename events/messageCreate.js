const { Events, } = require('discord.js');
const { GamblingWebsiteDatabase, } = require('../handler/database');
const { PhishingUrlAPI, } = require('../handler/api');

const commandPrefix = process.env.PREFIX;

const db = new GamblingWebsiteDatabase();
const api = new PhishingUrlAPI();

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
            if (command) {
                if (command.execute) {
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
            }
            return;
        }

        let urls = message.content.match(UrlRegex);
        urls = urls ? urls : [];
        for (let url of urls) {
            url = new URL(url);
            if (db.isGambling(url)) {
                message.reply('**內含博弈網站!**');
                break;
            }

            if (api.isPhishUrl(url.href)) {
                message.reply('**內含釣魚網站!**');
                break;
            }
        }
    },
};
