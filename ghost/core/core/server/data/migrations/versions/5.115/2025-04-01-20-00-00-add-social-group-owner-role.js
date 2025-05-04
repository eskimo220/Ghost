const logging = require('@tryghost/logging');
const {default: ObjectID} = require('bson-objectid');
const {createTransactionalMigration, meta} = require('../../utils');

module.exports = createTransactionalMigration(
    async function up(knex) {
        logging.info('Creating "Social Group Owner" role');
        const existingRole = await knex('roles').where({
            name: 'Social Group Owner'
        }).first();

        if (existingRole) {
            logging.warn('"Social Group Owner" role already exists, skipping');
            return;
        }

        await knex('roles').insert({
            id: (new ObjectID()).toHexString(),
            name: 'Social Group Owner',
            description: 'Social Group Owner to manage social group created',
            created_by: meta.MIGRATION_USER,
            created_at: knex.raw('current_timestamp')
        });
    },
    async function down(knex) {
        logging.info('Deleting role "Social Group Owner"');
        await knex('roles').where({
            name: 'Social Group Owner'
        }).del();
    }
);