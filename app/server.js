const http = require('http');

const version = "1.0.1"; // Students will modify this!
const port = 3000;

const server = http.createServer((req, res) => {
  // Read an environment variable passed by Kubernetes (Staging or Production)
  const environment = process.env.ENVIRONMENT || "Local";

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1>Welcome to GitOps!</h1>
        <p><strong>Version:</strong> ${version}</p>
        <p><strong>Environment:</strong> ${environment}</p>
        <hr/>
        <p><i>Edit <code>app/server.js</code> and push to see the magic happen!</i></p>
      </body>
    </html>
  `;
  res.end(html);
});

server.listen(port, () => {
  console.log(`Server running at port ${port} on version ${version}`);
});
