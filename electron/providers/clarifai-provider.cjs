/**
 * Clarifai Provider
 * Handles Clarifai API format
 */

const { BaseProvider } = require('./base-provider.cjs');

class ClarifaiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'clarifai';
    this.displayName = 'Clarifai';
    this.baseUrl = config.baseUrl || 'https://api.clarifai.com/v2';
    this.model = config.model || 'gpt-4-turbo';
    this.userId = config.userId || 'openai'; // Model owner
    this.appId = config.appId || 'chat-completion'; // App ID
    
    // Clarifai free tier: 1000 requests/month
    this.requestsPerMinute = 5;
    this.tokensPerMinute = 100000;
  }

  getAvailableModels() {
    return [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'OpenAI via Clarifai' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic' },
      { id: 'llama-3-70b-instruct', name: 'Llama 3 70B', description: 'Meta' },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google' },
    ];
  }

  async complete(prompt, systemInstruction = null, options = {}) {
    const retryCount = options.retryCount || 0;

    if (!this.apiKey) {
      throw new Error('Clarifai PAT (Personal Access Token) not configured');
    }

    const inputContent = (prompt || '') + (systemInstruction || '');
    const estimatedTokens = Math.ceil(inputContent.length / 4);
    
    this.checkRateLimits(estimatedTokens);
    this.incrementUsage(estimatedTokens);

    const url = `${this.baseUrl}/users/${this.userId}/apps/${this.appId}/models/${this.model}/outputs`;
    console.log(`[ClarifaiProvider] Calling API with model: ${this.model}`);

    // Combine system instruction and prompt
    let fullPrompt = prompt;
    if (systemInstruction) {
      fullPrompt = `System: ${systemInstruction}\n\nUser: ${prompt}`;
    }

    const requestBody = {
      inputs: [{
        data: {
          text: {
            raw: fullPrompt
          }
        }
      }]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 429 && retryCount < 3) {
          const waitTime = 20 * Math.pow(2, retryCount);
          console.log(`[ClarifaiProvider] Rate limited. Retrying in ${waitTime}s...`);
          await this.sleep(waitTime * 1000);
          return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
        }
        
        throw new Error(`Clarifai API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.outputs?.[0]?.data?.text?.raw) {
        return data.outputs[0].data.text.raw;
      }
      
      throw new Error('Invalid response from Clarifai API');
    } catch (error) {
      if (retryCount < 3 && error.message.includes('fetch failed')) {
        await this.sleep(5000);
        return this.complete(prompt, systemInstruction, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }

  setUserId(userId) {
    this.userId = userId;
  }

  setAppId(appId) {
    this.appId = appId;
  }
}

module.exports = { ClarifaiProvider };
