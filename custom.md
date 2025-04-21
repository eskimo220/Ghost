<!-- TOC -->

- [Purpose](#purpose)
- [Database Migration Knex](#database-migration-knex)
    - [Create bookmarks table js.](#create-bookmarks-table-js)
    - [Add access permissions for specified Ghost roles](#add-access-permissions-for-specified-ghost-roles)
    - [Add table definition into schema.js](#add-table-definition-into-schemajs)
    - [Run knex migration](#run-knex-migration)
- [Create Model core/server/models/](#create-model-coreservermodels)
- [Create API Controller core/server/api/endpoints](#create-api-controller-coreserverapiendpoints)
    - [Create API Controller](#create-api-controller)
    - [Create API Controller /core/server/api/endpoints](#create-api-controller-coreserverapiendpoints)
- [API Routes core/server/web/api/endpoints/admin/](#api-routes-coreserverwebapiendpointsadmin)
    - [Append routes and API Controller mapping](#append-routes-and-api-controller-mapping)
    - [Append Routes to allowlisted](#append-routes-to-allowlisted)
- [Other files](#other-files)
- [Summary of related files](#summary-of-related-files)
- [API Test](#api-test)
- [Project build](#project-build)

<!-- /TOC -->

---

## Purpose

- Create table `social_bookmarks`
- Create API to query, read, add, delete table social_booknarks
    - POST: */ghost/api/admin/socialbookmarks/*
    ```        json    
            {
                "bookmarks": [
                    {
                        "post_id": "67fc90513336d884cbd8c6cc",
                        "user_id": "1"
                    }
                ]
            } 
    ``` 
    - GET: */ghost/api/admin/socialbookmarks?filter=user_id:'11111'*
    - GET: */ghost/api/admin/socialbookmarks/:id*
    - DELETE: */ghost/api/admin/socialbookmarks/:id*

---

## Database Migration (Knex) 

Create migration table js file in specified version *`/ghost/core/core/server/data/migrations/versions/5.115`*. Migration js will automatically performed when ghost database creating or runing `yarn knex migrator migrate`.

### Create bookmarks table js.
 
 `ghost/core/core/server/data/migrations/versions/5.115/2025-04-01-21-00-01-add-social-bookmarks-table.js`  


 ```js
const {addTable} = require('../../utils');
module.exports = addTable('social_bookmarks', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    user_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'users.id', cascadeDelete: true},
    post_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'posts.id', cascadeDelete: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'string', maxlength: 24, nullable: false},
    '@@UNIQUE_CONSTRAINTS@@': [
        ['user_id', 'post_id']
    ]    
});
```
Make sure use cascadeDelete for referenced column.

### Add access permissions for specified Ghost roles 

Migration file path: `ghost/core/core/server/data/migrations/versions/5.115/2025-04-01-21-00-04-set-social-permissions.js`  

Object value of `object: 'socialbookmark'` in permissions is the same of export name of `social-bookmarks.js`, but ignore upper-lower case.  


```js of permissions
const {combineTransactionalMigrations, addPermissionWithRoles} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse Bookmarks',
        action: 'browse',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Read Bookmarks',
        action: 'read',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Add Bookmarks',
        action: 'add',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author']),
    addPermissionWithRoles({
        name: 'Delete Bookmarks',
        action: 'destroy',
        object: 'socialbookmark'
    }, ['Administrator', 'Editor', 'Author'])
);
```

### Add table definition into schema.js

Ghost some validation use `schema.js` to validate table, so besides of migration js file, you need add the same declaration of table into `schema.js`.    

`schema.js` path is `ghost/core/core/server/data/schema/schema.js`.  


```json added to schema
    social_bookmarks: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        user_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'users.id', cascadeDelete: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'posts.id', cascadeDelete: true},
        created_at: {type: 'dateTime', nullable: false},
        created_by: {type: 'string', maxlength: 24, nullable: false},
        '@@UNIQUE_CONSTRAINTS@@': [
            ['user_id', 'post_id']
        ]    
    },    
```

### Run knex migration

Run migration command to create table.

`yarn knex migrator migrate`

---

## Create Model (core/server/models/)

Ghost model use bookshelf framework, just extend it as `ghost/core/core/server/models/social-bookmark.js`.  


```js of bookmarks model
const ObjectId = require('bson-objectid').default;
const ghostBookshelf = require('./base');
const errors = require('@tryghost/errors');
const models = require('./index');
const debug = require('@tryghost/debug')('models');
const SocialBookmark = ghostBookshelf.Model.extend({
    tableName: 'social_bookmarks', 

    defaults() {
        return {
            id: ObjectId().toHexString()
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
            throw new errors.ValidationError({message: `Users cannot bookmark their own posts.`});
        }
    }
});

module.exports = {
    SocialBookmark: ghostBookshelf.model('SocialBookmark', SocialBookmark)
};
```

---

## Create API Controller (core/server/api/endpoints)

API Controller file is server entry point, create `ghost/core/core/server/api/endpoints/social-bookmarks.js`.  

### Create API Controller

```js of API Controller
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
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
            return models.SocialBookmark.findPage(frame.options);
        }

    },

    read: {
        headers: {cacheInvalidate: false},
        options: ['include'],
        data: ['id', 'user_id', 'post_id'],
        permissions: true,
        query(frame) {
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
```

Above `Add` has data structure of `frame.data.bookmarks[0]`, so only add one record, no bulk processing. json file as following.  


```json    
            {
                "bookmarks": [
                    {
                        "post_id": "67fc90513336d884cbd8c6cc",
                        "user_id": "1"
                    }
                ]
            } 
``` 

### Create API Controller (/core/server/api/endpoints)

Add API Controller declaration into `ghost/core/core/server/api/endpoints/index.js`.

```js declare API Controller 
    //custom added
    get socialBookmarks() {
        return apiFramework.pipeline(require('./social-bookmarks'), localUtils);
    },
```

---

## API Routes (core/server/web/api/endpoints/admin/)

### Append routes and API Controller mapping

`ghost/core/core/server/web/api/endpoints/admin/routes.js`  
`ghost/core/core/server/web/api/endpoints/admin/custom-routes.js`

To add new routing information in web `routes.js`, modify `routes.js` as following.  

In `routes.js`  


```js
    customApi(router);
```

In new file of `custom-routes.js`  


```js
const api = require('../../../../api').endpoints;
const {http} = require('@tryghost/api-framework');
const mw = require('./middleware');

/**
 * @returns {import('express').Router}
 */
module.exports = function customApiRoutes(router) {
    // Bookmarks
    router.get('/socialbookmarks', mw.authAdminApi, http(api.socialBookmarks.browse));
    router.get('/socialbookmarks/:id', mw.authAdminApi, http(api.socialBookmarks.read));
    router.post('/socialbookmarks', mw.authAdminApi, http(api.socialBookmarks.add));
    router.del('/socialbookmarks/:id', mw.authAdminApi, http(api.socialBookmarks.destroy));

    return router;
};
```

The name of `socialBookmarks` in `api.socialBookmarks.browse` must be the same as API Controller declaration in `index.js` API Ccontroller 

`ghost/core/core/server/api/endpoints/index.js`  


```js
   get socialBookmarks() {
        return apiFramework.pipeline(require('./social-bookmarks'), localUtils);
    },
```

### Append Routes to `allowlisted`

Append routes to `allowlisted` of `ghost/core/core/server/web/api/endpoints/admin/middleware.js`.  


```js 
socialbookmarks: ['GET', 'POST', 'DELETE']
```

![alt text](https://s3-ap-northeast-1.amazonaws.com/legend-file-upload-240805/2025/04/custom01.png)

---

## Other files 

Modify file of `ghost/api-framework/lib/validators/input/all.js` to add routes path of `socialbookmark` to permission check function.

![alt text](https://s3-ap-northeast-1.amazonaws.com/legend-file-upload-240805/2025/04/custom02.png)

---

## Summary of related files

| Functions      | New/Modify | File                                                                                                    |
|----------------|------------|---------------------------------------------------------------------------------------------------------|
| Table          | New        | ghost/core/core/server/data/migrations/versions/5.115/2025-04-01-21-00-01-add-social-bookmarks-table.js |
|                | New        | ghost/core/core/server/data/migrations/versions/5.115/2025-04-01-21-00-04-set-social-permissions.js     |
|                | Append     | ghost/core/core/server/data/schema/schema.js                                                            |
| Model          | New        | ghost/core/core/server/models/social-bookmark.js                                                        |
| API Controller | New        | ghost/core/core/server/api/endpoints/social-bookmarks.js                                                |
|                | Append     | ghost/core/core/server/api/endpoints/index.js                                                           |
|                | Modify     | ghost/api-framework/lib/validators/input/all.js                                                         |
| API Routes     | Append     | ghost/core/core/server/web/api/endpoints/admin/routes.js                                                |
|                | New        | ghost/core/core/server/web/api/endpoints/admin/custom-routes.js                                         |
|                | Modify     | ghost/core/core/server/web/api/endpoints/admin/middleware.js                                            |

---

## API Test

- Add bookmarks

![alt text](https://s3-ap-northeast-1.amazonaws.com/legend-file-upload-240805/2025/04/custom03.png)


- Get bookmarks

![alt text](https://s3-ap-northeast-1.amazonaws.com/legend-file-upload-240805/2025/04/custom04.png)

- Delete bookmarks

![alt text](https://s3-ap-northeast-1.amazonaws.com/legend-file-upload-240805/2025/04/custom05.png)

---

## Project build

Ghost core project is js-based except individual ts, run `yarn` to make sure referenced package exists. That's all right.

`yarn` or `yarn install` 
`yarn build`
`yarn dev`

