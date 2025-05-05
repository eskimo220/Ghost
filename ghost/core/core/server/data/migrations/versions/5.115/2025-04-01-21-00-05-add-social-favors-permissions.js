const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialFavors',
        action: 'browse',
        object: 'socialfavor'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialFavors',
        action: 'read',
        object: 'socialfavor'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialFavors',
        action: 'add',
        object: 'socialfavor'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialFavors',
        action: 'destroy',
        object: 'socialfavor'
    }, ['Administrator', 'Editor', 'Author'])
);
