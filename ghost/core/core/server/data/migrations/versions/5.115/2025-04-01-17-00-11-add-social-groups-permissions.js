const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialGroups',
        action: 'browse',
        object: 'socialgroup'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialGroups',
        action: 'read',
        object: 'socialgroup'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialGroups',
        action: 'add',
        object: 'socialgroup'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Edit SocialGroups',
        action: 'edit',
        object: 'socialgroup'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialGroups',
        action: 'destroy',
        object: 'socialgroup'
    }, ['Administrator', 'Editor', 'Author'])
);
