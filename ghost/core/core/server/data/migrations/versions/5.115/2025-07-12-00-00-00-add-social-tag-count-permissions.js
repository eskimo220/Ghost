const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

//Add permission for role of Author and Editor
module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Count Tags',
        action: 'count',
        object: 'tag'
    }, ['Editor', 'Author'])    
);
