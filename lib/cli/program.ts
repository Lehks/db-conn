import commander from 'commander';
import packageJSON from '../../package.json';

const program = new commander.Command();
program.version(packageJSON.version);
program.command('generate', 'generate SQL and JS/TS files');
program.command('create-database', 'create database from generated SQL.');
program.command('drop-database', 'drop database from generated SQL.');
program.parse(process.argv);
