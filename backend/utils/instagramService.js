const axios = require('axios');

class InstagramService {
  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID;
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    this.accessToken = null;
  }

  getAuthUrl() {
    const state = Math.random().toString(36).substring(7);
    const scope = 'user_profile,user_media';
    
    return `https://api.instagram.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scope}&response_type=code&state=${state}`;
  }

  async getAccessToken(code) {
    try {
      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code: code
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      return { success: true, token: this.accessToken, userId: response.data.user_id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserProfile() {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );
      
      return {
        success: true,
        username: response.data.username,
        accountType: response.data.account_type,
        mediaCount: response.data.media_count
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Note: Instagram Graph API requires Business/Creator account for posting
  async createMediaContainer(imageUrl, caption) {
    try {
      // This is a simplified version - real implementation requires more steps
      const response = await axios.post(
        `https://graph.instagram.com/me/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${this.accessToken}`
      );

      return {
        success: true,
        containerId: response.data.id
      };
    } catch (error) {
      console.error('Instagram API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Instagram posting requires Business Account and additional setup'
      };
    }
  }
}

module.exports = new InstagramService();