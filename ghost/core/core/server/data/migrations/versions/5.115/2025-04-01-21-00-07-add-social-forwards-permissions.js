const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialForwards',
        action: 'browse',
        object: 'socialforward'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialForwards',
        action: 'read',
        object: 'socialforward'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialForwards',
        action: 'add',
        object: 'socialforward'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialForwards',
        action: 'destroy',
        object: 'socialforward'
    }, ['Administrator', 'Editor', 'Author'])
);
