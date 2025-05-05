const {addTable} = require('../../utils');

//关注
module.exports = addTable('social_follows', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    followed_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'users.id', cascadeDelete: true},
    user_id: {type: 'string', maxlength: 24, nullable: false, unique: false, index: true, references: 'users.id', cascadeDelete: true},
    follow_couple: {type: 'string', maxlength: 48, nullable: false, unique: true, index: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'string', maxlength: 24, nullable: false}
});
