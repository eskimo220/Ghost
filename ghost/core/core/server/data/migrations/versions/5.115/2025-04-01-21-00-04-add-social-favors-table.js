const {addTable} = require('../../utils');

//点赞
module.exports = addTable('social_favors', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    user_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'users.id', cascadeDelete: true},
    post_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'posts.id', cascadeDelete: true},
    type: {type: 'string', maxlength: 24, nullable: false, defaultTo: 'like'},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'string', maxlength: 24, nullable: false},
    '@@UNIQUE_CONSTRAINTS@@': [
        ['user_id', 'post_id']
    ]    
});