const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.bjjheroes.com/a-z-bjj-fighters-list';
const bjjFightersList = [];
requestPromise(url)
  .then(html => {
    //success!
    //const run = () => {
    try {
      return Promise.all(cheerio('#tablepress-8 > .row-hover > tr', html)
        .toArray()
        .map((element, index) => {

          const firstName = cheerio('.column-1', element)
            .text();
          const lastName = cheerio('.column-2', element)
            .text();
          const nickname = cheerio('.column-3', element)
            .text();
          const team = cheerio('.column-4', element)
            .text();
          const url = cheerio('.column-1 > a', element)
            .attr('href');
          const id = url.replace('/?p=', '');
          const fighter = {
            firstName,
            lastName,
            nickname,
            team,
            url,
            id
          };

          if (index > 900 && index < 1000) {
            return requestPromise(`https://www.bjjheroes.com${url}`)
              .then(html => {
                const lineageElement = cheerio('#post-2729 > .text-content > p', html)
                  .toArray()
                  .filter(element => {
                    if (cheerio(element, html)
                      .text()
                      .includes('Lineage')) {
                      return cheerio(element, html)
                        .text();
                    }
                  })[0];
                const lineage = cheerio(lineageElement, html)
                  .text();
                fighter['lineage'] = lineage;
                bjjFightersList.push(fighter)
              })
              .delay(500)
              .catch(error => {
                bjjFightersList.push(fighter)
              });
          }
        }));
    } catch (error) {
      console.log(url);
      console.log(error);
    }
    //};
  })
  .finally((res) => {
    //console.log(res)
    //console.log(bjjFightersList);
    const bjjFightersListJsonContent = JSON.stringify(bjjFightersList);
    fs.writeFile("./bjj-fighters-lineage-11.json", bjjFightersListJsonContent, 'utf8', error => {
      if (error) {
        return console.log(error);
      }
      console.log("json file created");
    });
    //return res.json(model);
  });

// Eduardo Barros, Eduardo Leitao missing pages