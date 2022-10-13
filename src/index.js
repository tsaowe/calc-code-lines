#!/usr/bin/env node
/**
 * support
 *
 * calc -h
 * calc [src]
 * calc src/index.js
 */
const fs = require('fs');
const path = require('path');

const currentWorkingDirectory = process.cwd();
const argv = process.argv.slice(2);
const arg = argv[0];

/************ config ************/
const computedFilePatterns = ['js', 'jsx', 'ts', 'tsx', 'vue', 'css', 'scss', 'less', 'html', 'md', 'json', 'yml', 'yaml', 'txt'];
const computedFolderPatterns = ['node_modules', '.git', '.svn'];

/**************************************** functions ****************************************/

function readFolderToList(folder) {
  const files = fs.readdirSync(folder);
  return files.map((file) => {
    const isFolder = fs.statSync(path.resolve(folder, file)).isDirectory();
    if (isFolder) {
      return readFolderToList(path.resolve(folder, file));
    } else {
      if (computedFilePatterns.includes(file.split('.').pop())) {
        return path.resolve(folder, file);
      }
      return null;
    }
  })
}

function getFileLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').length;
}


function flatten(arr) {
  return arr.reduce((prev, next) => {
    return prev.concat(Array.isArray(next) ? flatten(next) : next);
  }, []);
}

function removeNullInArray(arr) {
  return arr.filter((item) => {
    return item !== null;
  })
}


/****************************************** program start ******************************************/
switch (arg) {
  case '-h':
    console.log(`example:
  calc -h, show this message
  calc [src], calculate the file lines under the src folder recursively
  calc src/index.js, calculate the file lines of the src/index.js
  
  auto ignore folder pattern
  1.  node_modules
  2.  .git 
  auto ingore image types
    `);
    break;
  case undefined:
    console.log('calc -h find more');
    break;
  default:
    const src = arg;

    const exist = fs.existsSync(src);

    if (!exist) {
      console.log('you are joking me? no such file or folder, try this: \n\n calc -h\n');
      return;
    }

    const isFolder = fs.statSync(src).isDirectory();
    const isFile = fs.statSync(src).isFile();
    const isNothing = !isFolder && !isFile;

    const statisticObject = {}

    if (isFile) {
      const filePath = path.resolve(currentWorkingDirectory, src);
      const fileLines = getFileLines(filePath);
      statisticObject[filePath] = fileLines;
    } else {
      const folder = path.resolve(currentWorkingDirectory, src);
      const files = readFolderToList(folder);
      const filesFlat = flatten(files);
      const filesFlatWithoutNull = removeNullInArray(filesFlat);
      filesFlatWithoutNull.forEach((filePath) => {
        const fileLines = getFileLines(filePath);
        statisticObject[filePath] = fileLines;
      });
    }

    const sortedStatisticObject = Object.keys(statisticObject).sort((a, b) => {
        return statisticObject[b] - statisticObject[a];
      }
    ).reduce((prev, next) => {
        prev[next] = statisticObject[next];
        return prev;
      }
      , {});


    const sortedKeys = Object.keys(sortedStatisticObject);

    const allValues = Object.values(sortedStatisticObject);
    const totalLines = allValues.reduce((prev, next) => prev + next, 0);

    const maxOfValue = Math.max(...allValues);
    const maxOfValueLength = maxOfValue.toString().length;

    console.log(`total: ${totalLines}\n`);

    const array = [];
    sortedKeys.forEach((key) => {
        const value = sortedStatisticObject[key];
        const valueStr = value.toString();
        const valueStrWithPadLeft = valueStr.padEnd(maxOfValueLength + 5, ' ');

        let relativePath = key.replace(currentWorkingDirectory, '');
        if(relativePath.startsWith('/')){
          relativePath = relativePath.substring(1);
        }
        return array.push(`${valueStrWithPadLeft} ${relativePath}`);
      }
    );

    console.log(array.join('\n'));
}



