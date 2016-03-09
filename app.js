var path         = require('path');
var fs           = require('fs');
var readline     = require('readline');
var _            = require('lodash');
var async        = require('async');
var baseDir      = __dirname;
var inputFolder  = 'inputs';
var outputFolder = 'outputs';
var tests        = []; 
var outputFile   = "\n";

fs.readdirSync(path.join(baseDir, inputFolder))
  .filter( (file) => {

  var filePath =  path.join(baseDir, inputFolder, file);
  var rd = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout,
      terminal: false
  });
  var count = 0;
  var testCant = 0;
  rd.on('line', (line) => {
      if(count!=0){
        if(line.length!=0){
          var splits = line.split(" ");
          var playersCant = parseInt(splits[0]);
          var score = parseInt(splits[1]);
          if( !_.isNaN(playersCant) ){
            tests[testCant] = {player:playersCant, score:score, values:[]};
            testCant++;
          }else{
            tests[testCant-1].values.push({player:splits[0], score:score})
          }
        }
      }
      count++;
  }).on('close', () => {
    
    async.waterfall([
        function(next) {
            _.map(tests, (value, key) => {
              value.values = _.orderBy(value.values, ['score'], ['desc']);
            });
            next(null, tests);
        },
        function(tests, next) {
            _.map(tests, (value, key) => {
              if(value.player > value.score){
                value.values.splice(value.score, value.player)
              }else if(value.player < value.score){
                var i = 0;
                while (i < (value.score - value.player) ) {
                  value.values.push({player:"***", score:"***"})
                  i++;
                }
              }
            })
            next(null, tests);
        },
        function(tests, next){
            _.map(tests, (value, test) => {
                outputFile += test+1 + "\n";
                _.map(value.values, (testValue, rank) => {
                  outputFile += rank+1 + " " + testValue.player + " " +testValue.score + "\n";
                });
            });
            next(null, outputFile)
        }
    ], function (err, result) {
        var fd = fs.openSync(path.join(baseDir, outputFolder, 'out.out'), 'w');
        fs.writeSync(fd, outputFile, 0, outputFile.length);
        process.exit(0);
    });

  })
});

