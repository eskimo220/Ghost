// @ts-ignore
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
// @ts-ignore
//const api = require('./index');
const logging = require('@tryghost/logging');
const ALLOWED_INCLUDES = ['user', 'followedUser'];

const messages = {
    notFound: 'follow not found.',
    duplicateEntry: 'Already followed this user.'
};

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'socialfollows',

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
            return models.SocialFollow.findPage({...frame.options, withRelated: ALLOWED_INCLUDES});
        }
    },

    read: {
        headers: {cacheInvalidate: false},
        options: ['include'],
        data: ['id'],
        permissions: true,
        query(frame) {
            // @ts-ignore
            return models.SocialFollow.findOne(frame.data, {...frame.options, withRelated: ALLOWED_INCLUDES})
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
        data: ['followed_id', 'user_id'],
        permissions: true,
        async query(frame) {
            try {
                // @ts-ignore
                return await models.SocialFollow.add(frame.data.socialfollows[0], frame.options);
            } catch (err) {
                logging.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new errors.InternalServerError({
                        message: tpl(messages.duplicateEntry, frame.data.socialfollows)
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
            return models.SocialFollow.destroy({...frame.options, require: true});
        }
    }
};

module.exports = controller;

