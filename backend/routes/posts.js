const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { content, platforms, scheduledDate, type } = req.body;
    
    const post = new Post({
      userId: req.userId,
      content,
      platforms,
      scheduledDate: new Date(scheduledDate),
      type
    });
    
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Get user's posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.userId }).sort({ scheduledDate: 1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    await Post.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;