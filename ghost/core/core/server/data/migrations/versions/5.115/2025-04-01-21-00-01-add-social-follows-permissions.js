const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialFollows',
        action: 'browse',
        object: 'socialfollow'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialFollows',
        action: 'read',
        object: 'socialfollow'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialFollows',
        action: 'add',
        object: 'socialfollow'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialFollows',
        action: 'destroy',
        object: 'socialfollow'
    }, ['Administrator', 'Editor', 'Author'])
);
