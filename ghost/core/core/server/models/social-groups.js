// @ts-nocheck
const ObjectId = require('bson-objectid').default;
const ghostBookshelf = require('./base');
const errors = require('@tryghost/errors');
const models = require('./index');
const logging = require('@tryghost/logging');

const SocialGroup = ghostBookshelf.Model.extend({
    tableName: 'social_groups',

    defaults() {
        return {
            id: ObjectId().toHexString(),
            max_members: 15,
            require_approval: false
        };
    },

    owner() {
        return this.belongsTo('User', 'creator_id');
    },

    members() {
        return this.hasMany('SocialGroupMember', 'group_id');
    },

    posts() {
        return this.hasMany('Post', 'group_id');
    },   

    initialize() {
        // @ts-ignore
        ghostBookshelf.Model.prototype.initialize.call(this);
        this.on('saving', this.validateFields);
    },

    async validateFields(model) {
        logging.info(JSON.stringify(model));
        
        const userId = model.get('creator_id');
        const groupName = model.get('group_name');
        const groupType = model.get('type');
        const groupStatus = model.get('status');

        if (!userId) {
            throw new errors.ValidationError({message: '`creator_id` is required.'});
        }

        if (!groupName) {
            throw new errors.ValidationError({message: '`group_name` is required.'});
        }

        if (!groupType) {
            throw new errors.ValidationError({message: '`type` is required.'});
        }

        if (!groupStatus) {
            throw new errors.ValidationError({message: '`status` is required.'});
        }        
 
        // @ts-ignore
        const user = await models.User.findOne({id: userId});
        if (!user) {
            throw new errors.NotFoundError({message: `User of creator with ID ${userId} not found.`});
        }        
    }
});

module.exports = {
    SocialGroup: ghostBookshelf.model('SocialGroup', SocialGroup)
};

