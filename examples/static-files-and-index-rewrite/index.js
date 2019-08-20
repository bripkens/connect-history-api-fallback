const express = require('express');
const history = require('../..');
const app = express();

const staticFileMiddleware = express.static('assets');
app.use(staticFileMiddleware);
app.use(history({
  disableDotRule: true,
  verbose: true
}));
app.use(staticFileMiddleware);

app.get('/users/5.json', (req, res) => {
  res.json({
    name: 'Tom Mason'
  });
});

const port = 5555;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
