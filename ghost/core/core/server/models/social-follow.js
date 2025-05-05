const ObjectId = require('bson-objectid').default;
const ghostBookshelf = require('./base');
const errors = require('@tryghost/errors');
const models = require('./index');
const logging = require('@tryghost/logging');

const SocialFollow = ghostBookshelf.Model.extend({
    tableName: 'social_follows',

    defaults() {
        return {
            id: ObjectId().toHexString()
        };
    },

    user() {
        return this.belongsTo('User', 'user_id');
    },

    followedUser() {
        return this.belongsTo('User', 'followed_id');
    },

    initialize() {
        // @ts-ignore
        ghostBookshelf.Model.prototype.initialize.call(this);
        this.on('saving', this.validateFields);
    },

    async validateFields(model) {
        logging.info(JSON.stringify(model));

        const userId = model.get('user_id');
        const followedId = model.get('followed_id');

        if (!userId) {
            throw new errors.ValidationError({message: '`user_id` is required.'});
        }
 
        if (!followedId) {
            throw new errors.ValidationError({message: '`followed_id` is required.'});
        }

        // @ts-ignore
        const user = await models.User.findOne({id: userId});
        if (!user) {
            throw new errors.NotFoundError({message: `User with ID ${userId} not found.`});
        }

        // @ts-ignore
        const followed = await models.User.findOne({id: followedId});
        if (!followed) {
            throw new errors.NotFoundError({message: `User with ID ${followedId} not found.`});
        }

        //set unique couple id
        model.set('follow_couple', userId.concat(followedId));
    }
});

module.exports = {
    SocialFollow: ghostBookshelf.model('SocialFollow', SocialFollow)
};
