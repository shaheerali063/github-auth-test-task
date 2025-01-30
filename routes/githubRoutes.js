const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

// Route to initiate GitHub authentication
router.get('/auth/github', githubController.redirectToGitHub);

// Callback route after GitHub authentication
router.get('/auth/github/callback', githubController.githubCallback);

// Route to fetch GitHub data (after authentication)
router.get('/user/github-data', githubController.fetchGitHubData);

module.exports = router;
