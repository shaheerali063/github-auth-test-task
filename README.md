
Uses
    Node.js v22/ ExpressJS
    Angular v19 /Angular Material

Need these ENVs to run

PORT=3000
MONGO_URI=mongodb://localhost:27017/integrations
ENCRYPTION_KEY=generate with `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`
IV_KEY=generate with `node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"`
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SESSION_SECRET= generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Note: Create an Oauth app on github under developer settings and copy the secrets