const fs = require("fs");
const contents = JSON.parse(fs.readFileSync("bjj-fighters-with-lineage.json"));

contents.map(element => {
  if (element['lineage']) {
    element['lineage'] = element['lineage'].replace('Lineage:', '')
    element['lineage'] = element['lineage'].replace('Lineage 1:', '')
  }
  return element;
})

const bjjFightersListJsonContent = JSON.stringify(contents);
fs.writeFile("./bjj-fighters-with-lineage-new.json", bjjFightersListJsonContent, 'utf8', error => {
  if (error) {
    return console.log(error);
  }
  console.log("json file created");
});