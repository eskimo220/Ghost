const ObjectId = require('bson-objectid').default;
const ghostBookshelf = require('./base');
const errors = require('@tryghost/errors');
const models = require('./index');
const logging = require('@tryghost/logging');

const SocialFavor = ghostBookshelf.Model.extend({
    tableName: 'social_favors',

    defaults() {
        return {
            id: ObjectId().toHexString(),
            type: 'favor'
        };
    },

    user() {
        return this.belongsTo('User', 'user_id');
    },

    post() {
        return this.belongsTo('Post', 'post_id');
    },

    initialize() {
        // @ts-ignore
        ghostBookshelf.Model.prototype.initialize.call(this);
        this.on('saving', this.validateFields);
    },

    async validateFields(model) {
        logging.info(JSON.stringify(model));

        const postId = model.get('post_id');
        const userId = model.get('user_id');

        if (!postId) {
            throw new errors.ValidationError({message: '`post_id` is required.'});
        }
 
        if (!userId) {
            throw new errors.ValidationError({message: '`user_id` is required.'});
        }

        // @ts-ignore
        const post = await models.Post.findOne({id: postId}, {withRelated: ['authors']});
        if (!post) {
            throw new errors.NotFoundError({message: `Post with ID ${postId} not found.`});
        }

        // @ts-ignore
        const user = await models.User.findOne({id: userId});
        if (!user) {
            throw new errors.NotFoundError({message: `User with ID ${userId} not found.`});
        }

        const postAuthorId = post.related('authors').find(author => author.id === userId);
        if (postAuthorId) {
            throw new errors.ValidationError({message: `Users cannot favor their own posts.`});
        }
    }
});

module.exports = {
    SocialFavor: ghostBookshelf.model('SocialFavor', SocialFavor)
};
