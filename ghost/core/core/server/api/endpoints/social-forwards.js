// @ts-ignore
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
// @ts-ignore
//const api = require('./index');
const logging = require('@tryghost/logging');
const ALLOWED_INCLUDES = ['post', 'post.authors', 'post.tags', 'sender', 'receiver'];

const messages = {
    notFound: 'forward not found.',
    duplicateEntry: 'forward already exists for this post receiver and user.'
};

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'socialforwards',

    browse: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include',
            'page',
            'limit',
            'fields',
            'filter',
            'order',
            'debug'
        ],
        validation: {
            options: {
                include: ALLOWED_INCLUDES
            }
        },
        permissions: true,
        query(frame) {  
            // @ts-ignore
            return models.SocialForward.findPage({...frame.options, withRelated: ALLOWED_INCLUDES});
        }

    },

    read: {
        headers: {cacheInvalidate: false},
        options: ['include'],
        data: ['id'],
        permissions: true,
        query(frame) {
            // @ts-ignore
            return models.SocialForward.findOne(frame.data, {...frame.options, withRelated: ALLOWED_INCLUDES})
                .then((entry) => {
                    if (!entry) {
                        return Promise.reject(new errors.NotFoundError({
                            message: tpl(messages.notFound)
                        }));
                    }
                    return entry;
                });
        }
    },

    add: {
        statusCode: 201,
        headers: {cacheInvalidate: false},
        options: ['include'],
        data: ['post_id', 'sender_id', 'receiver_id'],
        permissions: true,
        async query(frame) {
            try {
                // @ts-ignore
                return await models.SocialForward.add(frame.data.socialforwards[0], frame.options);
            } catch (err) {
                logging.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new errors.InternalServerError({
                        message: tpl(messages.duplicateEntry, frame.data.socialforwards)
                    });
                }
                throw err;
            }
        }
    }, 

    destroy: {
        statusCode: 204,
        headers: {cacheInvalidate: false},
        options: ['id'],
        permissions: true,
        query(frame) {
            // @ts-ignore
            return models.SocialForward.destroy({...frame.options, require: true});
        }
    }
};

module.exports = controller;
