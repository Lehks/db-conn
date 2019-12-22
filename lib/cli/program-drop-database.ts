import commander from 'commander';
import packageJSON from '../../package.json';
import dropDatabase from './tools/drop-database';

const program = new commander.Command();
program.version(packageJSON.version);
program.arguments('<database-definition>');
program.action(databaseDefinition => {
    dropDatabase.execute(databaseDefinition).then().catch(e => { throw e; });
});

program.parse(process.argv);
