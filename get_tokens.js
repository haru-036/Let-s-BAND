const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  "491175564633-8oo5ksrorn2622tondpsulmjrh2hpju9.apps.googleusercontent.com",
  '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',
  "http://localhost:8000/auth/google/callback"
);

// Access scopes for read-only Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

// Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  /** Pass in the scopes array defined above.
    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
  scope: scopes,
  // Enable incremental authorization. Recommended as a best practice.
  include_granted_scopes: true
});

