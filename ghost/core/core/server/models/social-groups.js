const _ = require('lodash');
// @ts-nocheck
const ObjectId = require('bson-objectid').default;
const ghostBookshelf = require('./base');
const errors = require('@tryghost/errors');
const models = require('./index');
const logging = require('@tryghost/logging');

const allStates = ['active', 'archived', 'approval'];
const activeStates = ['active'];

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
    },
    
    enforcedFilters: function enforcedFilters(options) {
        if (options.context && options.context.internal) {
            return null;
        }

        return options.context && options.context.public ? 'status:[' + allStates.join(',') + ']' : null;
    },

    defaultFilters: function defaultFilters(options) {
        const ctx = options.context || {};

        // 1. Internal context (e.g., background tasks): no filters
        if (ctx.internal) {
            return null;
        }

        // 3. Otherwise (public or non-admin user): only show active groups
        return 'status:active';
    },

    /**
     * You can pass an extra `status=VALUES` field.
     * Long-Term: We should deprecate these short cuts and force users to use the filter param.
     */
    extraFilters: function extraFilters(options) {
        if (!options.status) {
            return null;
        }

        let filter = null;

        // CASE: Check if the incoming status value is valid, otherwise fallback to "active"
        if (options.status !== 'all') {
            options.status = allStates.indexOf(options.status) > -1 ? options.status : 'active';
        }

        if (options.status === 'active') {
            filter = `status:[${activeStates}]`;
        } else if (options.status === 'all') {
            filter = `status:[${allStates}]`;
        } else {
            filter = `status:${options.status}`;
        }

        delete options.status;

        return filter;
    }
});

module.exports = {
    SocialGroup: ghostBookshelf.model('SocialGroup', SocialGroup)
};

