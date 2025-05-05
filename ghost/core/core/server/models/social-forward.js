const ObjectId = require('bson-objectid').default;
const ghostBookshelf = require('./base');
const errors = require('@tryghost/errors');
const models = require('./index');
const logging = require('@tryghost/logging');

const SocialForward = ghostBookshelf.Model.extend({
    tableName: 'social_forwards',

    defaults() {
        return {
            id: ObjectId().toHexString()
        };
    },

    sender() {
        return this.belongsTo('User', 'sender_id');
    },

    receiver() {
        return this.belongsTo('User', 'receiver_id');
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
        const senderId = model.get('sender_id');
        const receiverId = model.get('receiver_id');

        if (!postId || !senderId || !receiverId) {
            throw new errors.ValidationError({message: 'Missing required field: post_id, sender_id, or receiver_id.'});
        }

        if (senderId === receiverId) {
            throw new errors.ValidationError({message: 'Cannot forward a post to yourself.'});
        }

        const [post, sender, receiver] = await Promise.all([
            // @ts-ignore
            models.Post.findOne({id: postId},{withRelated: ['authors']}),
            // @ts-ignore
            models.User.findOne({id: senderId}),
            // @ts-ignore
            models.User.findOne({id: receiverId})
        ]);

        if (!post) {
            // @ts-ignore
            throw new errors.ValidationError({message: `Post ${postId} does not exist.`});
        }

        if (!sender || !receiver) {
            // @ts-ignore
            throw new errors.ValidationError({message: 'Sender or receiver does not exist.'});
        }

        const postAuthorId = post.related('authors').find(author => author.id === receiverId);
        if (postAuthorId) {
            // @ts-ignore
            throw new errors.ValidationError({message: 'You cannot forward a post to the post\'s author.'});
        }
    }
});

module.exports = {
    SocialForward: ghostBookshelf.model('SocialForward', SocialForward)
};

