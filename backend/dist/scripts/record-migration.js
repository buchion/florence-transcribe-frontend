"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function recordMigration() {
    await data_source_1.AppDataSource.initialize();
    try {
        await data_source_1.AppDataSource.query('INSERT INTO migrations (timestamp, name) VALUES ($1, $2)', [1764582730948, 'CreateSubscriptionTables1764582730948']);
        console.log('✅ Migration recorded successfully');
    }
    catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('UNIQUE')) {
            console.log('✅ Migration already recorded');
        }
        else {
            throw error;
        }
    }
    await data_source_1.AppDataSource.destroy();
}
recordMigration().catch(console.error);
//# sourceMappingURL=record-migration.js.map