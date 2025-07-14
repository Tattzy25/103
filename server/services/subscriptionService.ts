import sql from '../database/neon';

export interface UserSubscription {
  user_id: string;
  subscription_tier: 'basic' | 'pro' | 'enterprise';
  tokens_remaining: number;
  tokens_used: number;
  subscription_expires_at?: Date;
}

export interface SubscriptionTier {
  tier_name: string;
  monthly_tokens: number;
  price_monthly: number;
  features: {
    voice_cloning: boolean;
    premium_voices: boolean;
    voice_downloads: boolean;
    max_voice_saves: number;
    priority_support?: boolean;
  };
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    if (!sql) {
      console.warn("Database not available");
      return null;
    }

    try {
      const result = await sql`
        SELECT user_id, subscription_tier, tokens_remaining, tokens_used, subscription_expires_at
        FROM users 
        WHERE user_id = ${userId}
      `;
      
      return result[0] as UserSubscription || null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  static async getSubscriptionTier(tierName: string): Promise<SubscriptionTier | null> {
    if (!sql) {
      console.warn("Database not available");
      return null;
    }

    try {
      const result = await sql`
        SELECT tier_name, monthly_tokens, price_monthly, features
        FROM subscription_tiers 
        WHERE tier_name = ${tierName}
      `;
      
      return result[0] as SubscriptionTier || null;
    } catch (error) {
      console.error('Error fetching subscription tier:', error);
      return null;
    }
  }

  static async consumeTokens(userId: string, tokensToConsume: number, operationType: string, operationDetails?: any): Promise<boolean> {
    if (!sql) {
      console.warn("Database not available");
      return false;
    }

    try {
      // Check current tokens
      const user = await this.getUserSubscription(userId);
      if (!user || user.tokens_remaining < tokensToConsume) {
        return false;
      }

      // Update user tokens
      await sql`
        UPDATE users 
        SET tokens_remaining = tokens_remaining - ${tokensToConsume},
            tokens_used = tokens_used + ${tokensToConsume}
        WHERE user_id = ${userId}
      `;

      // Log token usage
      await sql`
        INSERT INTO token_usage (user_id, operation_type, tokens_consumed, operation_details)
        VALUES (${userId}, ${operationType}, ${tokensToConsume}, ${JSON.stringify(operationDetails || {})})
      `;

      return true;
    } catch (error) {
      console.error('Error consuming tokens:', error);
      return false;
    }
  }

  static async hasFeatureAccess(userId: string, feature: keyof SubscriptionTier['features']): Promise<boolean> {
    const user = await this.getUserSubscription(userId);
    if (!user) return false;

    const tier = await this.getSubscriptionTier(user.subscription_tier);
    if (!tier) return false;

    return tier.features[feature] === true;
  }

  static async canSaveVoice(userId: string): Promise<boolean> {
    const user = await this.getUserSubscription(userId);
    if (!user) return false;

    const tier = await this.getSubscriptionTier(user.subscription_tier);
    if (!tier) return false;

    // Check current saved voices count
    if (!sql) return false;

    try {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM voice_library 
        WHERE user_id = ${userId} AND voice_category = 'saved'
      `;

      const currentSavedCount = parseInt(result[0]?.count || '0');
      return currentSavedCount < tier.features.max_voice_saves;
    } catch (error) {
      console.error('Error checking saved voices count:', error);
      return false;
    }
  }

  static getTokenCosts() {
    return {
      tts: 1,
      stt: 1,
      translate: 1,
      voice_clone: 100,
      voice_download: 5,
      voice_preview: 0
    };
  }
}
