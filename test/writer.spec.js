import ansiColors from 'ansi-colors';
import fs from 'fs';
import path from 'path';
import test from 'tape';
import { stub } from 'sinon';

import writer from '../src/writer.js';

import { URL } from 'url'; // in Browser, the URL in native accessible on window

// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;

const tmpDir = path.resolve(__dirname, '../tmp');

test('writer should write to cwd if base dir is not specified', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportFilePath = path.join(process.cwd(), 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt')
    .then(() => {
      t.true(
        fs.statSync(reportFilePath).isFile(),
        'report file has been created in the current working directory'
      );
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .then(() => {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
    });
});

test('writer should write to a base folder if it is specified', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportDirPath = path.join(process.cwd(), 'foodir');
  const reportSubdirPath = path.join(reportDirPath, '/subdir');
  const reportFilePath = path.join(reportSubdirPath, 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt', 'foodir/subdir')
    .then(() => {
      t.true(
        fs.statSync(reportFilePath).isFile(),
        'report file has been created in the specified base folder'
      );
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .then(() => {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
      fs.rmdirSync(reportSubdirPath);
      fs.rmdirSync(reportDirPath);
    });
});

test('writer should strip colors from formatted output', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportFilePath = path.join(process.cwd(), 'foo.txt');

  t.plan(1);

  writer(ansiColors.blue('footext'), 'foo.txt')
    .then(() => {
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'colors have been stripped in report file'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .then(() => {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
    });
});
