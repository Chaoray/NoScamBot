const { GoogleSafeBrowsingAPI, CheckIsPhishingAPI, PhishStatsAPI, PhishingDatabaseAPI, } = require('../handler/phishing_api');

describe('phishing_api測試', () => {
    xtest('google safe api crawl', async () => {
        const api = new GoogleSafeBrowsingAPI('AIzaSyAAF-pYOi7Ib0PqpkJ1NY3fnqPam5MQEgA');

        const testUrl = new URL('https://www.google.com');
        const data = await api.lookUp(testUrl);

        expect(data.matches).toBeUndefined();
    });

    xtest('phishing stats api test', async () => {
        const api = new PhishStatsAPI();

        const testUrl = new URL('https://www.google.com');
        const data = await api.lookUp(testUrl);

        expect(data.length).toBe(0);
    });

    test('phishing url api test', async (done) => {
        const api = new CheckIsPhishingAPI();

        await api.init();

        let testUrl = new URL('https://www.google.com');
        let res = await api.isPhishUrl(testUrl);

        expect(res).toBe(false);

        testUrl = new URL('https://000nt6r.wcomhost.com/');
        res = await api.isPhishUrl(testUrl);

        expect(res).toBe(true);
    }, 30000);

    xtest('phishing database test init', async () => {
        const api = new PhishingDatabaseAPI();
        api.update().then(async () => {
            const target = new URL('https://www.google.com');
            expect(api.lookUp(target)).toBe(false);
        });
    });
});
