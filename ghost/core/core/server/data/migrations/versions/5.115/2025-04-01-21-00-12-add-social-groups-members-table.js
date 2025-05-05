const {addTable} = require('../../utils');

//group's joined users
module.exports = addTable('social_group_members', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    group_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'social_groups.id', cascadeDelete: true},
    user_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'users.id', cascadeDelete: true},
    status: {type: 'string', maxlength: 60, nullable: false, default: 'active', index: true, validations: {isIn: [['active', 'archived', 'disabled']]}},
    role_id: {type: 'string', maxlength: 24, nullable: false, index: true, references: 'roles.id', cascadeDelete: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'string', maxlength: 24, nullable: false},    
    updated_at: {type: 'dateTime', nullable: true},
    updated_by: {type: 'string', maxlength: 24, nullable: true},        
    '@@UNIQUE_CONSTRAINTS@@': [
        ['group_id', 'user_id']
    ]    
});

