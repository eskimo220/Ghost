const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse Bookmarks',
        action: 'browse',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read Bookmarks',
        action: 'read',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add Bookmarks',
        action: 'add',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete Bookmarks',
        action: 'destroy',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author'])
);
