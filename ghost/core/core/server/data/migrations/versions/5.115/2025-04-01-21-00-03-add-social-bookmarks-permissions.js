const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialBookmarks',
        action: 'browse',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialBookmarks',
        action: 'read',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialBookmarks',
        action: 'add',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialBookmarks',
        action: 'destroy',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author'])
);

