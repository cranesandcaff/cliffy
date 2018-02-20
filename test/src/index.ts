import * as assert from 'assert';
import { CLI } from '../../lib';
const { log } = console;

const cliInstance = new CLI();

describe('Init CLI', () => {

  it('Create', () => assert(cliInstance));

  it('Set delimiter', () => {
    const delimiter = Math.random().toString(36);
    cliInstance.setDelimiter(delimiter);
    assert.equal(cliInstance.getDelimiter(), delimiter);
    cliInstance.setDelimiter('');
  });

});

describe('Commands', () => {
  it('Get commands count', () => {
    assert.equal(cliInstance.getCommandsCount(), 0);
  });

  it('Add commands', () => {
    cliInstance
      .addCommand('hello', {
        // tslint:disable-next-line:no-empty
        action: (parameters, options) => {},
      })
      .addCommand('hey', {
        // tslint:disable-next-line:no-empty
        action: (parameters, options) => {},
      })
      .addCommand('bie', {
        // tslint:disable-next-line:no-empty
        action: (parameters, options) => {},
        subcommands: {
          something: {
            options: [
              'joint',
              'hi',
            ],
            parameters: [
              { label: 'num', type: 'number' },
            ],
            action(parameters, options) {
              log('I Did Something!');
              log(parameters);
              log(options);
            },
          },
          nothing: {
            action(parameters, options) {
              log('I Did Nothing!');
            },
          },
        },
      });
    assert.equal(cliInstance.getCommandsCount(), 3);
  });

  it('Remove exist command', () => {
    const isRemovedExist = cliInstance.removeCommand('hey');
    assert.equal(isRemovedExist, true);
    const isRemovedNotExist = cliInstance.removeCommand(Math.random().toString(36));
    assert.equal(isRemovedNotExist, true);
  });
});

describe('Visible', () => {

  it('Hide', () => assert(cliInstance.hide()));

  it('Show', () => assert(cliInstance.show()));

});
