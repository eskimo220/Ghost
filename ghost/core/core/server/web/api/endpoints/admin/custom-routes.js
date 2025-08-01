const api = require('../../../../api').endpoints;
const {http} = require('@tryghost/api-framework');
const mw = require('./middleware');

/**
 * @returns {import('express').Router}
 */
module.exports = function customApiRoutes(router) {
    // bookmarks
    router.get('/social/bookmarks', mw.authAdminApi, http(api.socialBookmarks.browse));
    router.get('/social/bookmarks/:id', mw.authAdminApi, http(api.socialBookmarks.read));
    router.post('/social/bookmarks', mw.authAdminApi, http(api.socialBookmarks.add));
    router.del('/social/bookmarks/:id', mw.authAdminApi, http(api.socialBookmarks.destroy));

    // forwards
    router.get('/social/forwards', mw.authAdminApi, http(api.socialForwards.browse));
    router.get('/social/forwards/:id', mw.authAdminApi, http(api.socialForwards.read));
    router.post('/social/forwards', mw.authAdminApi, http(api.socialForwards.add));
    router.del('/social/forwards/:id', mw.authAdminApi, http(api.socialForwards.destroy));

    //follows
    router.get('/social/follows', mw.authAdminApi, http(api.socialFollows.browse));
    router.get('/social/follows/:id', mw.authAdminApi, http(api.socialFollows.read));
    router.post('/social/follows', mw.authAdminApi, http(api.socialFollows.add));
    router.del('/social/follows/:id', mw.authAdminApi, http(api.socialFollows.destroy));

    //favors
    router.get('/social/favors', mw.authAdminApi, http(api.socialFavors.browse));
    router.get('/social/favors/:id', mw.authAdminApi, http(api.socialFavors.read));
    router.post('/social/favors', mw.authAdminApi, http(api.socialFavors.add));
    router.del('/social/favors/:id', mw.authAdminApi, http(api.socialFavors.destroy));

    //social groups
    router.get('/social/groups', mw.authAdminApi, http(api.socialGroups.browse));
    router.get('/social/groups/:id', mw.authAdminApi, http(api.socialGroups.read));
    router.get('/social/groups_count', mw.authAdminApi, http(api.socialGroups.count));
    router.post('/social/groups', mw.authAdminApi, http(api.socialGroups.add));
    router.put('/social/groups/:id', mw.authAdminApi, http(api.socialGroups.edit));
    router.del('/social/groups/:id', mw.authAdminApi, http(api.socialGroups.destroy));

    //social group members
    router.get('/social/members', mw.authAdminApi, http(api.socialGroupMembers.browse));
    router.get('/social/members/:id', mw.authAdminApi, http(api.socialGroupMembers.read));
    router.post('/social/members', mw.authAdminApi, http(api.socialGroupMembers.add));
    router.put('/social/members/:id', mw.authAdminApi, http(api.socialGroupMembers.edit));
    router.del('/social/members/:id', mw.authAdminApi, http(api.socialGroupMembers.destroy));
    
    // ## Tags
    router.get('/tags/all/count', mw.authAdminApi, http(api.tags.count));

    return router;
};
