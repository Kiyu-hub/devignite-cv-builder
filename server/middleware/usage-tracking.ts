// ==========================================
// PHASE 1: ENHANCED USAGE TRACKING MIDDLEWARE
// ==========================================

import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { createLogger, auditLogger } from '../lib/logger';

const logger = createLogger('UsageTracking');

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

/**
 * Middleware to track feature usage with comprehensive logging
 */
export function trackFeatureUsageMiddleware(
  featureType: string,
  featureName: string
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.auth?.userId;
    const startTime = Date.now();

    if (!userId) {
      return next();
    }

    // Intercept response to track success/failure
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);
    let responseIntercepted = false;

    const trackUsage = async (wasSuccessful: boolean, errorDetails?: string) => {
      if (responseIntercepted) return;
      responseIntercepted = true;

      const processingTimeMs = Date.now() - startTime;
      const user = await storage.getUser(userId);

      try {
        // Track in feature usage tracking table
        await storage.trackFeatureUsage({
          userId,
          featureType,
          featureName,
          cvId: req.body?.cvId || req.params?.cvId || null,
          templateId: req.body?.templateId || req.params?.templateId || null,
          usageCount: 1,
          planAtUsage: user?.currentPlan || 'basic',
          wasSuccessful: wasSuccessful ? 1 : 0,
          errorDetails,
          processingTimeMs,
          metadata: {
            method: req.method,
            path: req.path,
            userAgent: req.get('user-agent'),
          },
        });

        logger.debug('Feature usage tracked', {
          userId,
          featureType,
          featureName,
          wasSuccessful,
          processingTimeMs,
        });
      } catch (error) {
        logger.error('Failed to track feature usage', error);
      }
    };

    // Override res.send
    res.send = function (data: any) {
      const wasSuccessful = res.statusCode >= 200 && res.statusCode < 400;
      trackUsage(wasSuccessful).catch(console.error);
      return originalSend(data);
    };

    // Override res.json
    res.json = function (data: any) {
      const wasSuccessful = res.statusCode >= 200 && res.statusCode < 400;
      trackUsage(wasSuccessful).catch(console.error);
      return originalJson(data);
    };

    next();
  };
}

/**
 * Middleware to enforce usage limits with auto-increment
 */
export function enforceUsageLimits(usageType: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const limits = await storage.getPlanUsageLimits(userId);

      if (!limits) {
        return res.status(402).json({
          error: 'No active plan',
          message: 'Please purchase a plan to use this feature',
        });
      }

      // Check if limit is reached
      let hasReachedLimit = false;
      let limitMessage = '';

      switch (usageType) {
        case 'cv_generation':
          if (limits.cvGenerationsLimit !== -1 && 
              limits.cvGenerationsUsed >= limits.cvGenerationsLimit) {
            hasReachedLimit = true;
            limitMessage = `You have reached your CV generation limit (${limits.cvGenerationsLimit}). Upgrade your plan for more.`;
          }
          break;

        case 'cover_letter':
          if (limits.coverLetterGenerationsLimit !== -1 && 
              limits.coverLetterGenerationsUsed >= limits.coverLetterGenerationsLimit) {
            hasReachedLimit = true;
            limitMessage = `You have reached your cover letter limit (${limits.coverLetterGenerationsLimit}). Upgrade your plan for more.`;
          }
          break;

        case 'ai_optimization':
          if (limits.aiOptimizationsLimit !== -1 && 
              limits.aiOptimizationsUsed >= limits.aiOptimizationsLimit) {
            hasReachedLimit = true;
            limitMessage = `You have reached your AI optimization limit (${limits.aiOptimizationsLimit}). Upgrade your plan for more.`;
          }
          break;

        case 'edit':
          if (limits.editsLimit !== -1 && 
              limits.editsUsed >= limits.editsLimit) {
            hasReachedLimit = true;
            limitMessage = `You have reached your edit limit (${limits.editsLimit}). Upgrade your plan for more.`;
          }
          break;

        case 'export':
          if (limits.exportsLimit !== -1 && 
              limits.exportsUsed >= limits.exportsLimit) {
            hasReachedLimit = true;
            limitMessage = `You have reached your export limit (${limits.exportsLimit}). Upgrade your plan for more.`;
          }
          break;
      }

      if (hasReachedLimit) {
        logger.warn('Usage limit reached', { userId, usageType, limits });

        await auditLogger.logUserAction(userId, 'usage_limit_reached', {
          entityType: 'usage_limit',
          metadata: { usageType, limits },
        });

        return res.status(403).json({
          error: 'Usage limit reached',
          message: limitMessage,
          limits: {
            current: limits,
            upgradeUrl: '/pricing',
          },
        });
      }

      // Increment usage after successful operation
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          try {
            await storage.incrementPlanUsage(userId, usageType);
            logger.debug('Usage incremented', { userId, usageType });
          } catch (error) {
            logger.error('Failed to increment usage', error);
          }
        }
      });

      next();
    } catch (error: any) {
      logger.error('Usage limit check failed', error);
      return res.status(500).json({
        error: 'Failed to check usage limits',
        message: error.message,
      });
    }
  };
}

/**
 * Middleware to check template access level
 */
export function enforceTemplateAccess() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.auth?.userId;
    const templateId = req.body?.templateId || req.params?.templateId;

    if (!userId || !templateId) {
      return next();
    }

    try {
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // If template is free, allow access
      if (template.isPremium === 0) {
        return next();
      }

      // Check user's plan and template access level
      const limits = await storage.getPlanUsageLimits(userId);
      if (!limits) {
        return res.status(402).json({
          error: 'Premium template requires an active plan',
          message: 'Please purchase a plan to access premium templates',
        });
      }

      // Check if user's plan allows premium template access
      if (limits.templateAccessLevel === 'free') {
        return res.status(403).json({
          error: 'Premium template access denied',
          message: 'Your current plan does not include premium templates. Upgrade to access this template.',
          upgradeUrl: '/pricing',
        });
      }

      next();
    } catch (error: any) {
      logger.error('Template access check failed', error);
      return res.status(500).json({
        error: 'Failed to check template access',
        message: error.message,
      });
    }
  };
}

/**
 * Middleware to log all API requests for monitoring
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const enabled = process.env.ENABLE_REQUEST_LOGGING === 'true';
  if (!enabled) {
    return next();
  }

  const startTime = Date.now();
  const { method, path, ip } = req;
  const userId = (req as any).auth?.userId;

  logger.info('API Request', {
    method,
    path,
    userId,
    ip,
    userAgent: req.get('user-agent'),
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    logger.info('API Response', {
      method,
      path,
      userId,
      statusCode,
      durationMs: duration,
    });
  });

  next();
}
