const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Count Tags',
        action: 'count',
        object: 'tag'
    }, ['Administrator', 'Owner', 'Admin Integration'])    
);
