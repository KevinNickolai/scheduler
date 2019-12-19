
const databaseManager = require('../../../classes/database/databaseManager.js');

/**
 * Export DatabaseManager tests
 * @param {Discord.client} client the client to test
 * @param {Chai.assert} assert the Chai assert library used for testing
 */
module.exports = (client, assert) => {

	describe('DatabaseManager', function () {

		describe('#constructor()', function () {

			it('creates an empty databaseManager object', function () {
				const newDatabaseManager = new databaseManager();


			});

		});

	});

}