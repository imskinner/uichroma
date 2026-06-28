// Vercel serverless entry point. The Express app (server.js) is exported without calling
// listen(), so Vercel can use it directly as the request handler for the API routes that
// vercel.json rewrites to /api. Static assets + the SPA are served by Vercel from
// client/dist (outputDirectory), not through this function.
module.exports = require('../server.js');
