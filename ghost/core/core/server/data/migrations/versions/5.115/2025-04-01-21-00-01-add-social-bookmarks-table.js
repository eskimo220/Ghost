const {addTable} = require('../../utils');

module.exports = addTable('social_bookmarks', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    user_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'users.id', cascadeDelete: true},
    post_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'posts.id', cascadeDelete: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'string', maxlength: 24, nullable: false},
    '@@UNIQUE_CONSTRAINTS@@': [
        ['user_id', 'post_id']
    ]    
});
