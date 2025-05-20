const {createIrreversibleMigration, dropTables} = require('../../utils');
//const {dropForeign} = require('../../../schema/commands');

module.exports = createIrreversibleMigration(async (knex) => {
    // await dropForeign({
    //     fromTable: 'posts',
    //     fromColumn: 'group_id',
    //     toTable: 'social_groups',
    //     toColumn: 'id',
    //     transaction: knex
    // });
});

//Drop custom tables
module.exports = dropTables(
    [
        // 'social_bookmarks',
        // 'social_follows',
        // 'social_favors',
        // 'social_forwards',
        // 'social_group_members',        
        // 'social_post_comments'
        // 'social_groups',
    ]);
