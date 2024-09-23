require ('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./sequelize');
const port = 3000;

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



sequelize.sync({force: false})
.then(() => {
  app.listen(port, () => {
    console.log("server is running on port ", port);
  });
})

