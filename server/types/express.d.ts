import { UserSubscription } from '../services/subscriptionService';

declare global {
  namespace Express {
    interface Request {
      userSubscription?: UserSubscription;
    }
  }
}
