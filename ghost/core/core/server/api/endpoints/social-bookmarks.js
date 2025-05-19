// @ts-ignore
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
// @ts-ignore
//const api = require('./index');
const logging = require('@tryghost/logging');
const ALLOWED_INCLUDES = ['post', 'post.authors', 'post.tags', 'user'];

const messages = {
    notFound: 'Bookmark not found.',
    duplicateEntry: 'Bookmark already exists for this post and user.'
};

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'socialbookmarks',

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
            return models.SocialBookmark.findPage({...frame.options, withRelated: ALLOWED_INCLUDES});
        }

    },

    read: {
        headers: {cacheInvalidate: false},
        options: ['include'],
        data: ['id'],
        permissions: true,
        query(frame) {
            // @ts-ignore
            return models.SocialBookmark.findOne(frame.data, {...frame.options, withRelated: ALLOWED_INCLUDES})
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
        data: ['post_id'],
        permissions: true,
        async query(frame) {
            try {
                // @ts-ignore
                return await models.SocialBookmark.add(frame.data.socialbookmarks[0], frame.options);
            } catch (err) {
                logging.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new errors.InternalServerError({
                        message: tpl(messages.duplicateEntry, frame.data.socialbookmarks)
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
            return models.SocialBookmark.destroy({...frame.options, require: true});
        }
    }
};

module.exports = controller;
