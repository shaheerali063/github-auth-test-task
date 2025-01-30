const passport = require('passport');
const axios = require('axios');
const User = require('../models/User');

// Redirect to GitHub for OAuth authentication
exports.redirectToGitHub = passport.authenticate('github', { scope: ['user', 'repo', 'read:user'] });

exports.githubCallback = (req, res, next) => {
  passport.authenticate('github', { failureRedirect: '/' }, (err, user, info) => {
    // If error occurs, handle it here
    if (err) {
      console.error('Error during authentication:', err);
      return res.status(500).send('Authentication failed due to an error.');
    }

    // If user not found, handle it here
    if (!user) {
      console.error('No user found');
      return res.status(500).send('Error during GitHub authentication. User data not available.');
    }

    // Log the user data from GitHub profile
    console.log('GitHub Profile after authentication:', user);

    // Log the user into the session
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Error logging in the user:', loginErr);
        return res.status(500).send('Error during login.');
      }

      // If everything is successful, redirect to the success page
      res.redirect('http://localhost:4200/auth/success');
    });
  })(req, res, next);  // Manually invoke the middleware with the proper req, res, next
};


// Fetch GitHub data (e.g., orgs, repos, commits, issues, etc.)
exports.fetchGitHubData = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('User not authenticated');
  }

  try {
    const { accessToken } = req.session.user;

    // Fetch organizations
    const orgsResponse = await axios.get('https://api.github.com/user/orgs', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Fetch repositories
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // For each repo, fetch more data (commits, pulls, issues, etc.)
    const reposData = await Promise.all(reposResponse.data.map(async (repo) => {
      const commitsResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const pullsResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/pulls`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const issuesResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/issues`, { headers: { Authorization: `Bearer ${accessToken}` } });

      return {
        ...repo,
        commits: commitsResponse.data,
        pulls: pullsResponse.data,
        issues: issuesResponse.data,
      };
    }));

    res.json({
      orgs: orgsResponse.data,
      repos: reposData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching GitHub data');
  }
};
