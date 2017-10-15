const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.send('index.html');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});