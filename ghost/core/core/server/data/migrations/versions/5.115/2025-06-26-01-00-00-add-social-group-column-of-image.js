const {createAddColumnMigration} = require('../../utils');

module.exports = createAddColumnMigration('social_groups', 'group_image', {
    type: 'string',
    maxlength: 2000,
    nullable: true
});
