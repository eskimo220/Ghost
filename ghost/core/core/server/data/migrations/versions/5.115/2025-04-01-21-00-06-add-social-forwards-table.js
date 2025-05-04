const {addTable} = require('../../utils');

//转发
module.exports = addTable('social_forwards', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    sender_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'users.id', cascadeDelete: true},
    receiver_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'users.id', cascadeDelete: true},
    post_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'posts.id', cascadeDelete: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'string', maxlength: 24, nullable: false},
    '@@UNIQUE_CONSTRAINTS@@': [
        ['sender_id', 'receiver_id', 'post_id']
    ]    
});
