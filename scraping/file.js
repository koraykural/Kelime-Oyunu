const {readFile, createWriteStream} = require('fs');
const fastcsv = require('fast-csv');

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
	let word = words[1];
	let length = words[2];
	let meaning = '';

	// If meaning includes commas and quotation marks
	if(words.length > 4) {
		for (let i = 3; i < words.length; i++) {
			const el = words[i];
			meaning = meaning.concat(',' + el);
		}
		meaning = meaning.substr(2, meaning.length - 3);
	}
	else
		meaning = words[3];

	// Check if meaning includes word itself
	const commonSubstring = longestCommonSubstring(word, meaning);
	if(commonSubstring*2.1 > word.length) {
		console.log(word + ' - ' + meaning);
		return;
	}

	list.push({word, length, meaning});
}

let list = [];

const ws = createWriteStream("out.csv");

readFile('outcome.csv', 'utf8', (err, data) => {
  console.log("READING LINES");
  const lines = data.split(/\r?\n/);

  console.log("LINES READ, PARSING LINES");
  lines.forEach(line => {
    const words = parseCSV(line);
	});
	
	fastcsv.write(list, {headers: false}).pipe(ws);


});