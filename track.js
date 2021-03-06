/** Beard - Track
 * A simple lil time tracking CLI for Beardo
 * run by typing `node track.js` in your console
 */

"use strict";
var fs        = require("fs");
var csv       = require("csv");
var _         = require('underscore');
var argv      = require('argv');
var inquirer  = require("inquirer");
var moment    = require('moment');


// Args
argv.option({
  name: 'input',
  short: 'i',
  type: 'string',
  description: 'Defines a CSV file for you to open',
  example: "'track.js --input=value' or 'track.js -s data/work.csv"
});


// File Manipulation
var questions = [{
    type: 'list',
    name: 'date',
    message: 'When did you do this entry?',
    choices: ['today', 'yesterday', 'two days ago', 'three days ago', 'other'],
    filter: function(val) {
      var date = moment();
      if (val === 'yesterday') {
        date = date.subtract(1, 'days');
      }
      else if (val === 'two days ago') {
        date = date.subtract(2, 'days');
      }
      else if (val === 'three days ago') {
        date = date.subtract(3, 'days');
      }
      else if (val === 'other') {
        // FIXME: need to add a way to handle alternate
        date = date;
      }

      return date.format('YYYY-MM-DD')
    }
  },{
    type: 'input',
    name: 'time',
    message: 'How long did you do this for? 1.5 (hrs)',
    default: '1.00',
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || "Please enter a number";
    }
  },{
    type: 'input',
    name: 'description',
    message: 'Describe what you did during this entry',
    default: 'did some things'
  },{
    type: "list",
    name: "project",
    message: "Choose a project",
    choices: []
  },{
    type: "list",
    name: "location",
    message: "Where did you do this work?",
    choices: []
  },{
    type: "list",
    name: "rate",
    message: "How much are you charging?",
    choices: [],
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || "Please enter a number";
    }
  }
];


function openFileFinished(error, fileData) {
  if (error) {
    return console.error('Had a project with opening file', error);
  }

  // Examine data
  csv.parse(fileData, function(error, csvData) {

    if (error) {
      return console.log('Had a problem with the CSV data: ', error);
    }

    // Loop Lines
    _.each(csvData, function(line, index) {

      // skip the first line in empty lines
      if (index !== 0 && line !== undefined && line !== '') {

        // Projects
        if (_.indexOf(questions[3].choices, line[3]) === -1 && line[3]) {
          questions[3].choices.push(line[3]);
        }

        // Locations
        if (_.indexOf(questions[4].choices, line[4]) === -1 && line[4]) {
          questions[4].choices.push(line[4]);
        }

        // Rates
        if (_.indexOf(questions[5].choices, line[5]) === -1 && line[5]) {
          questions[5].choices.push(line[5]);
        }
      }
    });

    // Refine (rate)
    questions[5].choices.sort(function compareNumbers(a, b) { return a - b });

    // Run CLI
    runApp();
  });

}


// Run App
function runApp() {

  // Run CLI
  inquirer.prompt(questions, function(answers) {

    // Convert to CSV
    // Add quotes so that the string escapes commas.
    // TODO: probably escape other characters as well.
    answers.description = '"' + answers.description + '"'
    var entryData = '\n' + _.values(answers).join(',');

    // Save entry
    fs.appendFile(args.options.input, entryData, function (err) {
      if (err) throw err;
      console.log('Added to file: ' + entryData);
    });
  });
}


console.log('Ahoy pilgrim. Beardo is ready to track');


// Start It Up
var args = argv.run();

// Check for Input
if (args.options.input !== undefined) {
  fs.readFile(args.options.input, openFileFinished);
} else {
  console.log('404 No beard found \nAre you sure you specified an --input -i value');
}



