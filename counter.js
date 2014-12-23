var spawn = require('child_process').spawn;
var Promise = require('promise');

function Counter(){
  this.timeout = null;
}
Counter.prototype.recognize = function(){
  var _this = this, result = '';
  return new Promise(function(resolve, reject){
    console.log('Recognize count');
    var counter = spawn('java', ['-jar', __dirname + '/FootballCounter.jar', 'http://192.168.178.50:8080/'], {
        cwd: __dirname,
        env: {
          'DYLD_LIBRARY_PATH': __dirname + '/FootballCounter_lib/'
        }
      }),
      standing = {};

    _this.timeout = setTimeout(function(){
      counter.kill('SIGTERM');
    }, 6000);

    counter.stdout.on('data', function (data) {
      result = result + data;
    });

    counter.stderr.on('data', function (data) {
      var err = '' + data;
      if(err.indexOf('[swscaler') === -1){
        console.error('Error while executing "java": \n %s', data);
      }
    });

    counter.on('close', function (code) {
      console.log(code);
      if (code === 0) {
        result = result.split('\n');
        var resultRed =  result[0] ? result[0].split('=')[1] : 0;
        var resultBlue =  result[1] ? result[1].split('=')[1] : 0;
        standing.red = parseInt(resultRed, 10);
        standing.blue = parseInt(resultBlue, 10);
        resolve(standing);
      } else {
        reject(code);
      }
    });

  });
};

module.exports = Counter;
