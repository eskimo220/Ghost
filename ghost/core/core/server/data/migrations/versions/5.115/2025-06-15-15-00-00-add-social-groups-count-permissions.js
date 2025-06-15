const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Count SocialGroups',
        action: 'count',
        object: 'socialgroup'
    }, ['Administrator', 'Admin Integration', 'Editor', 'Author'])    
);
