var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    req = require('request'),
    cheerio = require('cheerio'),
    app = express();

app.get('/', function(request, response){
  // Redirect to scrape
  response.redirect('/scrape');
});

app.get('/scrape', function(request, response){
  // We will scrape data here
  var url = 'http://www.imdb.com/title/tt1392190/';

  req(url, function(error, res, html){
    if(error){
      response.json({
        success: false,
        message: 'Scraping failed'
      });
    }

    // Traverse the DOM
    var $ = cheerio.load(html);

    var title, release, rating;
    var json = {title: '', release: '', rating: ''};

    // Scrape title and release
    $('.header').filter(function(){
      var data = $(this);

      // Title
      title = data.children().first().text();
      json.title = title;

      // Release year
      release = data.children().last().children().text();
      json.release = release;
    });

    // Scrape rating
    $('.star-box-giga-star').filter(function(){
      var data = $(this);
      rating = data.text();
      json.rating = rating;
    });

    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(error){
      if(error){
        response.send(error);
      }
      // Successful!
      console.log('File \'output.json\' successfully written');
    });

    response.send(json);
  });

});

// Start our node web server
var server = http.createServer(app);
server.listen(3000);
console.log('Magic happens on port 3000');
