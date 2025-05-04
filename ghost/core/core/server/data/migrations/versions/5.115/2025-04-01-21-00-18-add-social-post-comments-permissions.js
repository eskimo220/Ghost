const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialPostComments',
        action: 'browse',
        object: 'socialpostcomment'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialPostComments',
        action: 'read',
        object: 'socialpostcomment'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialPostComments',
        action: 'add',
        object: 'socialpostcomment'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Edit SocialPostComments',
        action: 'edit',
        object: 'socialpostcomment'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialPostComments',
        action: 'destroy',
        object: 'socialpostcomment'
    }, ['Administrator', 'Editor', 'Author'])
);
