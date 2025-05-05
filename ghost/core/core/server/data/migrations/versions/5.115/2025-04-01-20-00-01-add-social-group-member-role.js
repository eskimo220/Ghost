const logging = require('@tryghost/logging');
const {default: ObjectID} = require('bson-objectid');
const {createTransactionalMigration, meta} = require('../../utils');

module.exports = createTransactionalMigration(
    async function up(knex) {
        logging.info('Creating "Social Group Member" role');
        const existingRole = await knex('roles').where({
            name: 'Social Group Member'
        }).first();

        if (existingRole) {
            logging.warn('"Social Group Member" role already exists, skipping');
            return;
        }

        await knex('roles').insert({
            id: (new ObjectID()).toHexString(),
            name: 'Social Group Member',
            description: 'Social Group Member to manage social group created',
            created_by: meta.MIGRATION_USER,
            created_at: knex.raw('current_timestamp')
        });
    },
    async function down(knex) {
        logging.info('Deleting role "Social Group Member"');
        await knex('roles').where({
            name: 'Social Group Member'
        }).del();
    }
);