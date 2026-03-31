let appPromise;

async function getApp() {
    if (!appPromise) {
        appPromise = (async () => {
            const mod = await import('../Backend/src/server.js');

            if (typeof mod.prepareApp === 'function') {
                await mod.prepareApp();
            }

            return mod.default;
        })();
    }

    return appPromise;
}

module.exports = async (req, res) => {
    const app = await getApp();
    return app(req, res);
};