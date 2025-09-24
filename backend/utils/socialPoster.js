const twitterService = require('./twitterService');
const linkedinService = require('./linkedinService');
const instagramService = require('./instagramService');

class SocialMediaPoster {
  constructor() {
    this.mode = process.env.SOCIAL_MEDIA_MODE || 'simulation';
  }

  async postToTwitter(content, mediaUrl = null) {
    if (this.mode === 'simulation') {
      return this.simulatePost('twitter', content, mediaUrl);
    }

    try {
      // Real Twitter API integration
      let mediaId = null;
      
      if (mediaUrl) {
        // Download and upload media (simplified)
        // mediaId = await twitterService.uploadMedia(mediaBuffer);
      }
      
      return await twitterService.postTweet(content, mediaId ? [mediaId] : []);
    } catch (error) {
      return {
        success: false,
        platform: 'twitter',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async postToLinkedIn(content, mediaUrl = null) {
    if (this.mode === 'simulation') {
      return this.simulatePost('linkedin', content, mediaUrl);
    }

    try {
      // Check if we have access token
      if (!linkedinService.accessToken) {
        return {
          success: false,
          platform: 'linkedin',
          error: 'LinkedIn not connected. Please authenticate first.',
          timestamp: new Date()
        };
      }
      
      return await linkedinService.postContent(content);
    } catch (error) {
      return {
        success: false,
        platform: 'linkedin',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async postToInstagram(content, mediaUrl = null) {
    if (this.mode === 'simulation') {
      return this.simulatePost('instagram', content, mediaUrl);
    }

    try {
      // Instagram requires special handling
      if (!mediaUrl) {
        return {
          success: false,
          platform: 'instagram',
          error: 'Instagram requires an image or video',
          timestamp: new Date()
        };
      }

      const result = await instagramService.createMediaContainer(mediaUrl, content);
      
      if (result.success) {
        return {
          success: true,
          platform: 'instagram',
          postId: result.containerId,
          message: 'Instagram post created successfully',
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          platform: 'instagram',
          error: result.error,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        success: false,
        platform: 'instagram',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  simulatePost(platform, content, mediaUrl) {
    console.log(`🐦 [SIMULATION] ${platform} Post:`, content);
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          platform: platform,
          postId: `sim_${platform}_${Date.now()}`,
          message: 'Post simulated successfully',
          timestamp: new Date().toISOString(),
          mode: 'simulation'
        });
      }, 1000);
    });
  }
}

module.exports = new SocialMediaPoster();