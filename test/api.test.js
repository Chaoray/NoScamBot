const { GoogleSafeBrowsingAPI, PhishingUrlAPI, } = require('../handler/api');

describe('api測試', () => {
    xtest('google safe api爬取', async () => {
        const api = new GoogleSafeBrowsingAPI('AIzaSyAAF-pYOi7Ib0PqpkJ1NY3fnqPam5MQEgA');

        const data = await api.lookUp('https://www.google.com');
        expect(data.matches).toBeUndefined();
    });

    test('phishing url api test', async () => {
        const api = new PhishingUrlAPI();

        const res = await api.isPhishUrl('https://www.google.com');

        expect(res).toBeFalsy();
    });
});
