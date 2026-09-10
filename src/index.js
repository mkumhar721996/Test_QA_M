const { createApp } = require('./api/app');

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`Defect tracker listening on port ${port}`);
});
