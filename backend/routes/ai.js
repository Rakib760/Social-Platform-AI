const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/auth');

// Free AI API using Hugging Face (no cost)
const HF_API_KEY = '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'; // Get free token from huggingface.co

router.post('/generate-content', auth, async (req, res) => {
  try {
    const { prompt, tone, platform } = req.body;
    
    // Simple prompt engineering to make content less AI-like
    const enhancedPrompt = `Create a social media post for ${platform} in a ${tone} tone. Make it sound human and authentic: ${prompt}`;
    
    // Using Hugging Face's free inference API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      { inputs: enhancedPrompt },
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );
    
    let generatedText = response.data.generated_text || 
                       "Check your AI API key or try again later.";
    
    // Fallback if API fails
    if (!response.data || response.data.error) {
      generatedText = generateFallbackContent(prompt, tone, platform);
    }
    
    res.json({ content: generatedText });
  } catch (error) {
    console.error('AI Error:', error);
    // Fallback content generation
    const fallbackContent = generateFallbackContent(
      req.body.prompt, 
      req.body.tone, 
      req.body.platform
    );
    res.json({ content: fallbackContent });
  }
});

// Fallback content generator (works without API)
function generateFallbackContent(prompt, tone, platform) {
  const templates = {
    twitter: [
      `🚀 Exciting update! ${prompt} What are your thoughts?`,
      `Just wrapped up an amazing session on ${prompt}. So grateful for the opportunity!`,
      `💡 Insightful moment: ${prompt}. How does this resonate with you?`
    ],
    linkedin: [
      `I'm excited to share insights about ${prompt}. This represents significant progress in our industry.`,
      `Professional reflection: ${prompt}. Would appreciate your perspectives on this development.`,
      `Industry update: ${prompt}. Looking forward to discussing implications with colleagues.`
    ],
    instagram: [
      `✨ Amazing day working on ${prompt}! So grateful for this journey. 🌟`,
      `Behind the scenes: ${prompt}. What do you think? 👀`,
      `Creating magic with ${prompt}! Stay tuned for more updates. 💫`
    ]
  };
  
  const platformTemplates = templates[platform] || templates.twitter;
  const randomTemplate = platformTemplates[Math.floor(Math.random() * platformTemplates.length)];
  
  return randomTemplate;
}

module.exports = router;