const express = require('express');
const history = require('../..');
const path = require('path');

const app = express();

const staticFileMiddleware = express.static('assets');
app.use(staticFileMiddleware);

const historyMiddleware = history({
  disableDotRule: true,
  verbose: true
});
app.use((req, res, next) => {
  // This is the ignore rule. You can do whatever checks you feel are necessary, e.g.
  // check headers, req path, external vars…
  if (req.path === '/signOut') {
    next();
  } else {
    historyMiddleware(req, res, next);
  }
});
app.use(staticFileMiddleware);

app.get('/users/5.json', (req, res) => {
  res.json({
    name: 'Tom Mason'
  });
});

app.get('/signOut', (req, res) => {
  console.log('custom signOut rule');
  res.sendFile(path.join(__dirname, 'assets', 'signOut.html'));
});

const port = 5555;
app.listen(port, () => {
  console.log(`Example app listening on port ${5555}!`);
});
