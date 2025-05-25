const _ = require('lodash');
const ObjectId = require('bson-objectid').default;
const ghostBookshelf = require('./base');
const errors = require('@tryghost/errors');
const models = require('./index');
const logging = require('@tryghost/logging');

const allStates = ['active', 'archived', 'disabled'];
const activeStates = ['active'];

let SocialGroupMember;
let SocialGroupMembers;

SocialGroupMember = ghostBookshelf.Model.extend({
    tableName: 'social_group_members',
 
    defaults() {
        return {
            id: ObjectId().toHexString()
        };
    },
    
    group() {
        return this.belongsTo('SocialGroup', 'group_id');
    },

    role() {
        return this.belongsTo('Role', 'role_id');
    },

    user() {
        return this.belongsTo('User', 'user_id');
    },
    
    initialize() {
        // @ts-ignore
        ghostBookshelf.Model.prototype.initialize.call(this);
        this.on('saving', this.validateFields);
    },

    async validateFields(model) {
        logging.info('model:', JSON.stringify(model));        
        
        const userId = model.get('user_id');
        const groupId = model.get('group_id');
        const roleId = model.get('role_id');
        const status = model.get('status');

        if (!userId) {
            throw new errors.ValidationError({message: '`user_id` is required.'});
        }
 
        if (!groupId) {
            throw new errors.ValidationError({message: '`group_id` is required.'});
        }

        if (!roleId) {
            throw new errors.ValidationError({message: '`role_id` is required.'});
        }

        if (!status) {
            throw new errors.ValidationError({message: '`status` is required.'});
        }

        // @ts-ignore
        const group = await models.SocialGroup.findOne({id: groupId});
        if (!group) {
            throw new errors.NotFoundError({message: `Group with ID ${groupId} not found.`});
        }

        if (group.get('status') !== 'active') {
            throw new errors.ValidationError({message: `Group with ID ${groupId} is not active.`});
        }
        
        // @ts-ignore
        const user = await models.User.findOne({id: userId});
        if (!user) {
            throw new errors.NotFoundError({message: `User with ID ${userId} not found.`});
        }

        // @ts-ignore
        const role = await models.Role.findOne({id: roleId});
        if (!role) {
            throw new errors.NotFoundError({message: `Role with ID ${roleId} not found.`});
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

SocialGroupMembers = ghostBookshelf.Collection.extend({
    model: SocialGroupMember
});

module.exports = {
    SocialGroupMember: ghostBookshelf.model('SocialGroupMember', SocialGroupMember),
    // @ts-ignore
    SocialGroupMembers: ghostBookshelf.collection('SocialGroupMembers', SocialGroupMembers)
};

