const {addTable} = require('../../utils');

//post_group
module.exports = addTable('social_post_comments', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    post_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'posts.id', cascadeDelete: true},
    user_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'users.id', setNullDelete: true},
    parent_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'social_comments.id', cascadeDelete: true},
    in_reply_to_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'social_comments.id', setNullDelete: true},
    status: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'published', validations: {isIn: [['published', 'hidden', 'deleted']]}},
    html: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
    edited_at: {type: 'dateTime', nullable: true},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: false},
    '@@INDEXES@@': [
        ['post_id', 'status']
    ]
});
