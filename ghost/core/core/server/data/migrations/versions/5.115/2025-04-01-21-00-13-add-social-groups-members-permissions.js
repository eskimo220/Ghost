const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialGroupMembers',
        action: 'browse',
        object: 'socialgroupmember'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialGroupMembers',
        action: 'read',
        object: 'socialgroupmember'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialGroupMembers',
        action: 'add',
        object: 'socialgroupmember'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Edit SocialGroupMembers',
        action: 'edit',
        object: 'socialgroupmember'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialGroupMembers',
        action: 'destroy',
        object: 'socialgroupmember'
    }, ['Administrator', 'Editor', 'Author'])
);
