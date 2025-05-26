// @ts-ignore
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
const logging = require('@tryghost/logging');
const ALLOWED_INCLUDES = ['posts', 'posts.authors', 'posts.tags', 'owner', 'members', 'members.user', 'members.role', 'count.members', 'count.posts', 'count.inactive_members'];

const messages = {
    notFound: 'group not found.',
    duplicateEntry: 'group already exists.'
};

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'socialgroups',

    browse: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include',
            'filter',
            'fields',
            'collection',
            'formats',
            'limit',
            'order',
            'page',
            'debug'
        ],
        validation: {
            options: {
                include: ALLOWED_INCLUDES
            }
        },
        permissions: true,
        query(frame) {  
            logging.info('group frame: ', JSON.stringify(frame));
            // @ts-ignore
            return models.SocialGroup.findPage({...frame.options, withRelated: ALLOWED_INCLUDES});
        }

    },
    
    read: {
        headers: {cacheInvalidate: false},
        options: ['include'],
        data: ['id'],
        permissions: true,
        query(frame) {
            logging.info('frame', JSON.stringify(frame));
            // @ts-ignore
            return models.SocialGroup.findOne(frame.data, {...frame.options, withRelated: ALLOWED_INCLUDES})
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
        data: ['creator_id', 'group_name', 'type', 'status'],
        permissions: true,
        async query(frame) {
            try {
                // @ts-ignore
                return await models.SocialGroup.add(frame.data.socialgroups[0], frame.options);
            } catch (err) {
                logging.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new errors.InternalServerError({
                        message: tpl(messages.duplicateEntry, frame.data.socialgroups)
                    });
                }
                throw err;
            }
        }
    }, 

    edit: {
        statusCode: 200,
        headers: {cacheInvalidate: false},
        options: [
            'include',
            'id',
            'transacting'
        ],
        data: ['creator_id', 'group_name', 'type', 'status'],
        permissions: true,
        async query(frame) {
            try {
                // @ts-ignore
                return await models.SocialGroup.edit(frame.data.socialgroups[0], frame.options);
            } catch (err) {
                logging.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new errors.InternalServerError({
                        message: tpl(messages.duplicateEntry, frame.data.socialgroups)
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
            return models.SocialGroup.destroy({...frame.options, require: true});
        }
    }
};

module.exports = controller;

