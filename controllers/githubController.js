const passport = require('passport');
const axios = require('axios');
const GitHubIntegration = require('../models/GithubIntegration');

// Redirect to GitHub for OAuth authentication
exports.redirectToGitHub = passport.authenticate('github', { scope: ['user', 'repo', 'read:user'] });

exports.githubCallback = (req, res, next) => {
  passport.authenticate('github', { failureRedirect: '/' }, async (err, user, info) => {
    if (err) {
      console.error('Error during authentication:', err);
      return res.status(500).send('Authentication failed due to an error.');
    }

    if (!user) {
      console.error('No user found');
      return res.status(500).send('Error during GitHub authentication. User data not available.');
    }

    req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error('Error logging in the user:', loginErr);
        return res.status(500).send('Error during login.');
      }

      // Store user in session
      req.session.user = {
        githubId: user.githubId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        lastSynced: user.lastSynced,
      };

      res.redirect('http://localhost:4200/auth/success');
    });
  })(req, res, next);
};


exports.checkGitHubConnection = async (req, res) => {
  if (!req.session.user) {
    return res.json({ connected: false });
  }

  try {
    const integration = await GitHubIntegration.findOne({ githubId: req.session.user.githubId });
    if (!integration) return res.json({ connected: false });

    res.json({
      connected: true,
      username: integration.username,
      avatarUrl: integration.avatarUrl,
      lastSynced: integration.lastSynced,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error checking connection' });
  }
};


exports.removeGitHubIntegration = async (req, res) => {
  if (!req.session.user) return res.status(401).send('Not authenticated');

  try {
    await GitHubIntegration.deleteOne({ githubId: req.session.user.githubId });

    // Destroy session so they are fully logged out
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Error removing integration');
      }

      res.json({ success: true, message: 'GitHub integration removed' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error removing integration' });
  }
};



// Fetch GitHub data (e.g., orgs, repos, commits, issues, etc.)
exports.fetchGitHubData = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('User not authenticated');
  }

  try {
    const user = await GitHubIntegration.findOne({ githubId: req.session.user.githubId });
    if (!user) return res.status(401).send('User not found');

    const decryptedToken = user.getDecryptedAccessToken();

    // Fetch organizations
    const orgsResponse = await axios.get('https://api.github.com/user/orgs', {
      headers: { Authorization: `Bearer ${decryptedToken}` },
    });

    // Fetch repositories
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${decryptedToken}` },
    });

    // Fetch repo data
    const reposData = await Promise.all(reposResponse.data.map(async (repo) => {
      const commitsResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`, { headers: { Authorization: `Bearer ${decryptedToken}` } });
      const pullsResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/pulls`, { headers: { Authorization: `Bearer ${decryptedToken}` } });
      const issuesResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/issues`, { headers: { Authorization: `Bearer ${decryptedToken}` } });

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
