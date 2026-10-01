const http = require("node:http");
const { createApp } = require("./server");

const port = process.env.ARC_WEB_PORT || 3005;
const server = http.createServer(createApp());

server.listen(port, () => {
  console.log(`Defect list web app listening on port ${port}`);
});
