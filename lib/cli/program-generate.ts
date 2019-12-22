import commander from 'commander';
import packageJSON from '../../package.json';
import generator from './tools/generator';

const program = new commander.Command();
program.version(packageJSON.version);
program.arguments('<database-definition>');
program.option('-d, --dryRun', 'generate SQL but print it instead of writing actual files', val => true, false);
program.action(databaseDefinition => {
    generator.generate(databaseDefinition, program.dryRun).then().catch(e => { throw e; });
});

program.parse(process.argv);
