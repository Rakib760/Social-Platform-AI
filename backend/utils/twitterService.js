const { TwitterApi } = require('twitter-api-v2');

class TwitterService {
  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    
    this.rwClient = this.client.readWrite;
  }

  async postTweet(content, mediaIds = []) {
    try {
      let tweetData = { text: content };
      
      // Add media if provided
      if (mediaIds.length > 0) {
        tweetData.media = { media_ids: mediaIds };
      }

      const response = await this.rwClient.v2.tweet(tweetData);
      
      return {
        success: true,
        platform: 'twitter',
        postId: response.data.id,
        message: 'Tweet posted successfully',
        url: `https://twitter.com/user/status/${response.data.id}`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Twitter API Error:', error);
      return {
        success: false,
        platform: 'twitter',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async uploadMedia(imageBuffer) {
    try {
      const mediaId = await this.client.v1.uploadMedia(imageBuffer, {
        mimeType: 'image/jpeg'
      });
      return mediaId;
    } catch (error) {
      console.error('Media upload error:', error);
      return null;
    }
  }

  async getUserProfile() {
    try {
      const user = await this.rwClient.v2.me();
      return {
        success: true,
        username: user.data.username,
        name: user.data.name,
        followers: user.data.public_metrics?.followers_count || 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TwitterService();