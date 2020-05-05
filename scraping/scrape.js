// FILE
const {readFile, createWriteStream} = require('fs');
const fastcsv = require('fast-csv');

// SCRAPER
const {Builder, By} = require('selenium-webdriver');

// DATABASE
/*
const Pool = require('pg').Pool;
let pool;
pool = new Pool({
  connectionString: 'postgres://rfejkuxfgnapqc:7e58fd3e27d75c9a5c3bd801d4ec38bc5b196748f8cbcca926f71a0df5d2926d@ec2-54-217-204-34.eu-west-1.compute.amazonaws.com:5432/d9n39tt5ivnh13',
  ssl: true
})
*/

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getCleantext = (inText) => {
  // Get only first line
  let text = inText.slice(0, inText.indexOf('<br>'));

  // Delete last column
  if(text[text.length - 1] === ':' || text[text.length - 1] === '.')
    text = text.slice(0, text.length - 1);

  // Delete tags
  if(text.includes('>'))
    text = text.slice(text.lastIndexOf('>')+1, text.length);

  // Delete if so short
  if(text.length < 12)
    return null;
  else
    return text;
}

const getWords = (indexer) => {
  readFile('kelimeler.csv', 'utf8', (err, data) => {
    console.log("READING LINES");
    const lines = data.split(/\r?\n/);
  
    console.log("LINES READ, WORD LIST BEING CREATED");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const arr = line.split(',');
      if(i % indexer == 0) {
        words.push({word: arr[0], letters: arr[1]});
      }
    }
  });
}

let driver = new Builder().forBrowser('chrome').build();

let words = [];
let addedWords = [];

const indexer = 13;
const ws = createWriteStream(indexer + ".csv");

const main = async () => {
  getWords(indexer);
  await sleep(3000);

  await driver.get('https://sozluk.gov.tr/');

  for(let i = 0; i < words.length; i++) {
    const word = words[i].word;
    try {
      await driver.findElement(By.name('q')).clear();
      await driver.findElement(By.name('q')).sendKeys(word);
      await driver.findElement(By.id('tdk-search-btn')).click();
      await sleep(800);
      const text = await driver.findElement(By.id('anlamlar-gts0')).findElement(By.tagName('p')).getAttribute('innerHTML');
      const cleanText = getCleantext(text);
      if(cleanText) {
        console.log(cleanText);
        addedWords.push({indexer: indexer, word: word, letters: words[i].letters, meaning: cleanText})
      }
      else
        console.log(`Passing ${word}`);
    } catch (error) {
      console.log(`Passing: ${word}`);
    }

    await sleep(700);
  }
  fastcsv
    .write(addedWords, { headers: false })
    .pipe(ws);
}

main();