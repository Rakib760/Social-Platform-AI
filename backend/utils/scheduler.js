const cron = require('node-cron');
const Post = require('../models/Post');
const socialPoster = require('./socialPoster');

class PostScheduler {
  constructor() {
    this.init();
  }

  init() {
    // Check for scheduled posts every minute
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        const postsToPublish = await Post.find({
          scheduledDate: { $lte: now },
          status: 'scheduled'
        }).populate('userId');

        for (const post of postsToPublish) {
          console.log(`Publishing post: ${post._id}`);
          
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

          console.log(`Post ${post._id} published to: ${post.platforms.join(', ')}`);
        }
      } catch (error) {
        console.error('Scheduler error:', error);
      }
    });

    console.log('🕒 Post scheduler started...');
  }
}

module.exports = new PostScheduler();