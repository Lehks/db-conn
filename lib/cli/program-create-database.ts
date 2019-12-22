import commander from 'commander';
import packageJSON from '../../package.json';
import createDatabase from './tools/create-database';

const program = new commander.Command();
program.version(packageJSON.version);
program.arguments('<database-definition>');
program.action(databaseDefinition => {
    createDatabase.execute(databaseDefinition).then().catch(e => { throw e; });
});

program.parse(process.argv);
