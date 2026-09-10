const http = require("node:http");
const { createApp } = require("./app");

const port = process.env.ARC_DEV_PORT || 8005;
const server = http.createServer(createApp());

server.listen(port, () => {
  console.log(`Defects API listening on port ${port}`);
});
