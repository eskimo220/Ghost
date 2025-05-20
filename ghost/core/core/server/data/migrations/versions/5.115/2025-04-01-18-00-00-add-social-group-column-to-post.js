const {createAddColumnMigration} = require('../../utils');

module.exports = createAddColumnMigration('posts', 'group_id', {
    type: 'string',
    maxlength: 24,
    nullable: true
    // references: 'social_groups.id',
    // cascadeDelete: true
});
