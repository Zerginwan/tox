const express = require('express');
const authRouter = require('./authRouter');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use('/auth', authRouter);

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`TOX server has been started on ${PORT}`)
    })
  } catch (e) {
    console.log(e);
  }
}

start();