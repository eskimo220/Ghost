// @ts-ignore
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
// @ts-ignore
//const api = require('./index');
const logging = require('@tryghost/logging');
const ALLOWED_INCLUDES = [];

const messages = {
    bookmarkNotFound: 'Bookmark not found.',
    duplicateBookmark: 'Bookmark already exists for this post and user.'
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
            //logging.info('frame', JSON.stringify(frame));          
            // @ts-ignore
            return models.SocialBookmark.findPage(frame.options);

            //Only user own's bookmark
            // const userId = frame.user?.get('id');
            // const _options = Object.assign({}, frame.options, {
            //     filter: `user_id:'${userId}'`
            // });    
            // // @ts-ignore
            // return models.SocialBookmark.findPage(_options);
        }

    },

    read: {
        headers: {cacheInvalidate: false},
        options: ['include'],
        data: ['id', 'user_id', 'post_id'],
        permissions: true,
        query(frame) {
            // @ts-ignore
            return models.SocialBookmark.findOne(frame.data, frame.options)
                .then((bookmark) => {
                    if (!bookmark) {
                        return Promise.reject(new errors.NotFoundError({
                            message: tpl(messages.bookmarkNotFound)
                        }));
                    }
                    return bookmark;
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
                return await models.SocialBookmark.add(frame.data.bookmarks[0], frame.options);
            } catch (err) {
                logging.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new errors.InternalServerError({
                        message: tpl(messages.duplicateBookmark, frame.data.bookmarks)
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
