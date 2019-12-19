import commander from 'commander';
import packageJSON from '../../package.json';
import generator from './generator';

const program = new commander.Command();
program.version(packageJSON.version);
program.arguments('<database-definition>');
program.option('-d, --dryRun', 'load and validate configuration but do not generate anything', val => true, false);
program.action(databaseDefinition => {
    generator.generate(databaseDefinition, program.dryRun).then().catch(e => { throw e; });
});

program.parse(process.argv);
