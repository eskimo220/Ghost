const api = require('../../../../api').endpoints;
const {http} = require('@tryghost/api-framework');
const mw = require('./middleware');

/**
 * @returns {import('express').Router}
 */
module.exports = function customApiRoutes(router) {
    // Bookmarks
    router.get('/socialbookmarks', mw.authAdminApi, http(api.socialBookmarks.browse));
    router.get('/socialbookmarks/:id', mw.authAdminApi, http(api.socialBookmarks.read));
    router.post('/socialbookmarks', mw.authAdminApi, http(api.socialBookmarks.add));
    router.del('/socialbookmarks/:id', mw.authAdminApi, http(api.socialBookmarks.destroy));

    return router;
};
