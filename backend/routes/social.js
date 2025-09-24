const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const socialPoster = require('../utils/socialPoster');
const router = express.Router();

// Test social media connection
router.post('/test-connection', auth, async (req, res) => {
  try {
    const { platform } = req.body;
    
    const testContent = 'Test connection post from AI Social Platform';
    let result;
    
    switch (platform) {
      case 'twitter':
        result = await socialPoster.postToTwitter(testContent);
        break;
      case 'linkedin':
        result = await socialPoster.postToLinkedIn(testContent);
        break;
      case 'instagram':
        result = await socialPoster.postToInstagram(testContent);
        break;
      default:
        return res.status(400).json({ error: 'Invalid platform' });
    }
    
    res.json({
      platform,
      success: result.success,
      message: result.message,
      mode: process.env.SOCIAL_MEDIA_MODE
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish post immediately
router.post('/publish-now', auth, async (req, res) => {
  try {
    const { postId } = req.body;
    
    const post = await Post.findOne({ _id: postId, userId: req.userId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Post to social media platforms
    const results = await socialPoster.postToPlatforms(
      post.platforms, 
      post.content, 
      post.mediaUrl
    );
    
    // Update post status
    post.postingResults = results;
    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();
    
    res.json({
      success: true,
      message: 'Post published successfully',
      results: results,
      mode: process.env.SOCIAL_MEDIA_MODE
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posting analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.userId, status: 'published' });
    
    const analytics = {
      totalPosts: posts.length,
      platforms: {
        twitter: posts.filter(p => p.platforms.includes('twitter')).length,
        linkedin: posts.filter(p => p.platforms.includes('linkedin')).length,
        instagram: posts.filter(p => p.platforms.includes('instagram')).length
      },
      successRate: posts.filter(p => 
        p.postingResults && p.postingResults.every(r => r.success)
      ).length / posts.length * 100
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;