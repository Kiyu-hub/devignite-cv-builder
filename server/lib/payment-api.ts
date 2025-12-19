// ==========================================
// PHASE 1: ENHANCED PAYMENT API ENDPOINTS
// ==========================================

import type { Request, Response } from 'express';
import { storage } from '../storage';
import { createLogger, auditLogger, createPerformanceMonitor } from './logger';
import { z } from 'zod';

const logger = createLogger('PaymentAPI');
const perfMonitor = createPerformanceMonitor('PaymentAPI');

/**
 * Payment transaction validation schemas
 */
const initiatePaymentSchema = z.object({
  planType: z.enum(['basic', 'pro', 'premium']),
  amount: z.number().positive(),
  currency: z.string().default('GHS'),
});

const verifyPaymentSchema = z.object({
  reference: z.string(),
});

/**
 * Initialize a payment transaction
 */
export async function initiatePayment(req: Request, res: Response) {
  const operationId = `initiate_payment_${Date.now()}`;
  perfMonitor.startTimer(operationId);
  
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = initiatePaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { planType, amount, currency } = validationResult.data;

    // Create payment transaction record
    const transaction = await storage.createPaymentTransaction({
      userId,
      transactionType: 'plan_purchase',
      amount,
      currency,
      provider: 'paystack',
      status: 'pending',
      planType,
      description: `Purchase of ${planType} plan`,
    });

    // Audit log
    await auditLogger.logPaymentEvent(userId, 'payment_initiated', {
      amount,
      currency,
      provider: 'paystack',
      transactionId: transaction.id,
      metadata: { planType },
    });

    logger.info('Payment initiated', {
      userId,
      transactionId: transaction.id,
      planType,
      amount,
    });

    perfMonitor.endTimer(operationId, { status: 'success' });

    return res.json({
      success: true,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    });
  } catch (error: any) {
    logger.error('Payment initiation failed', error);
    perfMonitor.endTimer(operationId, { status: 'error' });

    return res.status(500).json({
      error: 'Payment initiation failed',
      message: error.message,
    });
  }
}

/**
 * Verify payment transaction
 */
export async function verifyPayment(req: Request, res: Response) {
  const operationId = `verify_payment_${Date.now()}`;
  perfMonitor.startTimer(operationId);

  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = verifyPaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { reference } = validationResult.data;

    // Find transaction by reference
    const transaction = await storage.getPaymentTransactionByReference(reference);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify user owns this transaction
    if (transaction.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update transaction status (would integrate with Paystack here)
    await storage.updatePaymentTransaction(transaction.id, {
      status: 'completed',
      completedAt: new Date(),
      providerStatus: 'success',
    });

    // If payment successful, update user plan and create plan history
    if (transaction.planType) {
      // Deactivate previous plans
      await storage.deactivatePreviousPlans(userId);

      // Create new plan history entry
      await storage.createUserPlanHistory({
        userId,
        planType: transaction.planType,
        previousPlan: (await storage.getUser(userId))?.currentPlan || 'basic',
        startDate: new Date(),
        isActive: 1,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: 'paystack',
        transactionReference: reference,
      });

      // Update user's current plan
      await storage.updateUserPlan(userId, transaction.planType);

      // Create plan usage limits for the new plan
      const pricingConfig = (await import('../../config/pricing.json')).default;
      const planConfig = pricingConfig.plans[transaction.planType];
      
      if (planConfig) {
        const now = new Date();
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        await storage.createPlanUsageLimits({
          userId,
          planType: transaction.planType,
          periodStart: now,
          periodEnd,
          cvGenerationsUsed: 0,
          cvGenerationsLimit: planConfig.limits.cvGenerations || -1,
          coverLetterGenerationsUsed: 0,
          coverLetterGenerationsLimit: planConfig.limits.coverLetterGenerations || -1,
          aiOptimizationsUsed: 0,
          aiOptimizationsLimit: planConfig.limits.aiRuns || -1,
          editsUsed: 0,
          editsLimit: planConfig.limits.editsAllowed || -1,
          exportsUsed: 0,
          exportsLimit: -1,
          templateAccessLevel: planConfig.limits.templateAccess || 'free',
        });
      }
    }

    // Audit log
    await auditLogger.logPaymentEvent(userId, 'payment_verified', {
      amount: transaction.amount,
      currency: transaction.currency,
      provider: 'paystack',
      transactionId: transaction.id,
      status: 'success',
    });

    logger.info('Payment verified', {
      userId,
      transactionId: transaction.id,
      reference,
    });

    perfMonitor.endTimer(operationId, { status: 'success' });

    return res.json({
      success: true,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        planType: transaction.planType,
      },
    });
  } catch (error: any) {
    logger.error('Payment verification failed', error);
    perfMonitor.endTimer(operationId, { status: 'error' });

    return res.status(500).json({
      error: 'Payment verification failed',
      message: error.message,
    });
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await storage.getPaymentTransactionsByUserId(userId);

    return res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.transactionType,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        planType: t.planType,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
    });
  } catch (error: any) {
    logger.error('Failed to fetch payment history', error);
    return res.status(500).json({
      error: 'Failed to fetch payment history',
      message: error.message,
    });
  }
}

/**
 * Get user's plan history
 */
export async function getPlanHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = await storage.getUserPlanHistory(userId);

    return res.json({
      success: true,
      planHistory: history.map(h => ({
        id: h.id,
        planType: h.planType,
        previousPlan: h.previousPlan,
        startDate: h.startDate,
        endDate: h.endDate,
        isActive: h.isActive === 1,
        amount: h.amount,
        currency: h.currency,
      })),
    });
  } catch (error: any) {
    logger.error('Failed to fetch plan history', error);
    return res.status(500).json({
      error: 'Failed to fetch plan history',
      message: error.message,
    });
  }
}

/**
 * Get current plan usage and limits
 */
export async function getPlanUsage(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limits = await storage.getPlanUsageLimits(userId);

    if (!limits) {
      return res.status(404).json({ error: 'No active plan found' });
    }

    return res.json({
      success: true,
      usage: {
        planType: limits.planType,
        period: {
          start: limits.periodStart,
          end: limits.periodEnd,
        },
        cvGenerations: {
          used: limits.cvGenerationsUsed,
          limit: limits.cvGenerationsLimit,
          remaining: limits.cvGenerationsLimit === -1 ? -1 : limits.cvGenerationsLimit - limits.cvGenerationsUsed,
        },
        coverLetters: {
          used: limits.coverLetterGenerationsUsed,
          limit: limits.coverLetterGenerationsLimit,
          remaining: limits.coverLetterGenerationsLimit === -1 ? -1 : limits.coverLetterGenerationsLimit - limits.coverLetterGenerationsUsed,
        },
        aiOptimizations: {
          used: limits.aiOptimizationsUsed,
          limit: limits.aiOptimizationsLimit,
          remaining: limits.aiOptimizationsLimit === -1 ? -1 : limits.aiOptimizationsLimit - limits.aiOptimizationsUsed,
        },
        edits: {
          used: limits.editsUsed,
          limit: limits.editsLimit,
          remaining: limits.editsLimit === -1 ? -1 : limits.editsLimit - limits.editsUsed,
        },
        templateAccessLevel: limits.templateAccessLevel,
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch plan usage', error);
    return res.status(500).json({
      error: 'Failed to fetch plan usage',
      message: error.message,
    });
  }
}
