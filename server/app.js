require ('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');



const app = express()
app.use(bodyParser.json());

const indexRouter = require('./routes/index');
const registerRouter = require('./routes/register');
const adminRouter = require('./routes/admin');
const loginRouter = require('./routes/login');
const filesRouter = require('./routes/myFiles');

app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/admin', adminRouter);
app.use('/myFiles', filesRouter);

const port = 3000;

app.listen(port, () => {
  console.log("server is running on port ", port);
});
