const fs = require('fs');
const path = require('path');
//read command files 
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
  
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
  
    return fileList;
  }
const commandFiles = getAllFiles('./src/commands')
.filter(file => !file.includes('register'))
.reduce((acc, filePath) => {
    const fileNameWithExtension = path.basename(filePath);
    const fileNameWithoutExtension =  path.parse(fileNameWithExtension).name;
    acc[fileNameWithoutExtension] = filePath
    return acc;
}, {});

module.exports = commandFiles;