const fs = require('fs');
const contents = JSON.parse(fs.readFileSync('bjj-fighters-with-lineage-cleanup.json'));

const lineageList = contents.map(element => {
  if (element['lineage']) {
    const lineageArray = element['lineage'].split('>');
    const trimmedLineageArray = lineageArray.map(name => {
      const trimmedName = name.trim();
      return trimmedName;
    });
    return trimmedLineageArray;
  }
});

const objectTree = {};
// this generates the lineage object tree
for (let i = 0; i < lineageList.length; ++i) {
  try {
    let copyObjectTree = objectTree;
    for (let j = 0; j < lineageList[i].length; ++j) {
      let currentName = lineageList[i][j];
      if (!copyObjectTree[currentName]) {
        copyObjectTree[currentName] = {};
      }
      copyObjectTree = copyObjectTree[currentName];
    }
  } catch (error) {
    console.log(error);
  }
}
//console.log(JSON.stringify(objectTree))

// this generates the lineage tree, in array format
const recurseTreeKeys = (o) => {
  const resultTree = [];
  const keys = Object.keys(o);
  let child = undefined;
  for (let i = 0; i < keys.length; ++i) {
    if (Object.keys(o[keys[i]])
      .length) {
      child = {};
      child['name'] = keys[i];
      child['children'] = recurseTreeKeys(o[keys[i]]);
    } else {
      child = {};
      child['name'] = keys[i];
    }
    resultTree.push(child);
  }
  return resultTree;
}

const tree = recurseTreeKeys(objectTree);
console.log(JSON.stringify(tree));