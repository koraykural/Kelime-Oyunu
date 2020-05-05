// FILE
const {readFile} = require('fs');

const Pool = require('pg').Pool;
let pool;
pool = new Pool({
  connectionString: 'postgres://rfejkuxfgnapqc:7e58fd3e27d75c9a5c3bd801d4ec38bc5b196748f8cbcca926f71a0df5d2926d@ec2-54-217-204-34.eu-west-1.compute.amazonaws.com:5432/d9n39tt5ivnh13',
  ssl: { rejectUnauthorized: false }
});

const addWordsToDB = (wordList) => {
  // Concat every word as value
  wordList.forEach(el => {
    const {word, letters, meaning} = el;
    pool.query('INSERT INTO words(word, letter_count, meaning) VALUES ($1,$2,$3)', [word, letters, meaning], (err, res) => {
      if(err) {
        console.log(err);
      }
    });
  });
}

const longestCommonSubstring = (string1, string2) => {
	// init max value
	var longestCommonSubstring = 0;
	// init 2D array with 0
	var table = [],
            len1 = string1.length,
            len2 = string2.length,
            row, col;
	for(row = 0; row <= len1; row++){
		table[row] = [];
		for(col = 0; col <= len2; col++){
			table[row][col] = 0;
		}
	}
	// fill table
        var i, j;
	for(i = 0; i < len1; i++){
		for(j = 0; j < len2; j++){
			if(string1[i] === string2[j]){
				if(table[i][j] === 0){
					table[i+1][j+1] = 1;
				} else {
					table[i+1][j+1] = table[i][j] + 1;
				}
				if(table[i+1][j+1] > longestCommonSubstring){
					longestCommonSubstring = table[i+1][j+1];
				}
			} else {
				table[i+1][j+1] = 0;
			}
		}
	}
	return longestCommonSubstring;
}

const parseCSV = (line) => {
	// Split line (indexer, word, length, meaning)
  const words = line.split(',');
	let word = words[0];
	let letters = words[1];
	let meaning = '';

	// If meaning includes commas and quotation marks
	if(words.length > 3) {
		for (let i = 2; i < words.length; i++) {
			const el = words[i];
			meaning = meaning.concat(',' + el);
		}
		meaning = meaning.substr(2, meaning.length - 2);
	}
	else
		meaning = words[2];

	return {word, letters, meaning};
}

const createWordList = (filename) => {
  readFile(filename, 'utf8', (err, data) => {
    console.log("READING LINES");
    const lines = data.split(/\r?\n/);

    let wordList = [];
  
    console.log("LINES READ, WORD LIST BEING CREATED");
    for (let i = 0; i < lines.length; i++) {
      const obj = parseCSV(lines[i]);
      wordList.push(obj);
    }

    addWordsToDB(wordList)
  });
}

const clearQuotes = (row) => {
  if(row.meaning.includes('"') || row.meaning.includes('\"\"') ||
  row.meaning.includes('\"\"\"') || row.meaning.includes('\"\"\"\"')) {
    let newMeaning = row.meaning.replace(/""""/g, '{quotation}');
    newMeaning = newMeaning.replace(/"/g, '');
    newMeaning = newMeaning.replace(/{quotation}/g, '"')
    pool.query('UPDATE words SET meaning = $1 WHERE id = $2', [newMeaning, row.id], (err, res) => {
      if(err)
        console.log(err);
    })
  }
}

const clearUnimportant = row => {
  // Check if meaning includes word itself
	const commonSubstring = longestCommonSubstring(row.word.toLowerCase(), row.meaning.toLowerCase());
	if(commonSubstring*2.1 > row.word.length) {
    pool.query('DELETE FROM words WHERE id = $1', [row.id], (err, res) => {
      if(err)
        console.log(err);
    })
		console.log(row.word + ' - ' + row.meaning);
	}
}

const updateWords = () => {
  pool.query('SELECT * FROM words', (err, res) => {
    if(err) 
      console.log(err);
    
    res.rows.forEach(row => {
      clearUnimportant(row);
    })
  })
}

const getTwo = (letter_count) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM words WHERE letter_count = $1 ORDER BY random() LIMIT 2', [letter_count], (err, res) => {
      if(err) {
        console.log(err);
        reject();
      }
      resolve(res.rows);
    })
  })
}

const succes = (res) => {
  res.forEach(el => {
    console.log(el.word);
    console.log(el.meaning + '\n\n');
  });
}

const fail = (err) => {

}


// for (let i = 4; i < 11; i++) {
//   getTwo(i)
//     .then(succes)
//     .catch(fail);
// }
updateWords();