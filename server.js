const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/', require('./app/routes'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is started on port: ${PORT}`);
})

// Start socket.io
const io = require('socket.io')(server);
require('./app/socket').init(io);

// Start redis cache
require('./app/data').init();