const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse SocialPostCommentReports',
        action: 'browse',
        object: 'socialpostcommentreport'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read SocialPostCommentReports',
        action: 'read',
        object: 'socialpostcommentreport'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add SocialPostCommentReports',
        action: 'add',
        object: 'socialpostcommentreport'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Edit SocialPostCommentReports',
        action: 'edit',
        object: 'socialpostcommentreport'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete SocialPostCommentReports',
        action: 'destroy',
        object: 'socialpostcommentreport'
    }, ['Administrator', 'Editor', 'Author'])
);
