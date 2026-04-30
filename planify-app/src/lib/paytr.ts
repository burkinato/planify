/**
 * Samet (Strategist) — PayTR Integration Library
 * Bora's P0 fix: Implements PayTR Iframe API integration
 */

import { createHmac } from 'node:crypto';

export interface PayTRTokenRequest {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  merchantOid: string;
  price: number; // in cents (kuruş for TRY)
  userName: string;
  userEmail: string;
  userAddress?: string;
  userPhone?: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
  timeoutLimit?: number; // minutes, default 30
  testMode?: number; // 1 for test, 0 for production
}

export interface PayTRTokenResponse {
  status: string;
  token?: string;
  reason?: string;
}

/**
 * Creates a PayTR iframe token for checkout
 * Docs: https://dev.paytr.com/iframe-api
 */
export async function createPayTRToken(params: PayTRTokenRequest): Promise<PayTRTokenResponse> {
  const {
    merchantId,
    merchantKey,
    merchantSalt,
    merchantOid,
    price,
    userName,
    userEmail,
    userAddress = '',
    userPhone = '',
    merchantOkUrl,
    merchantFailUrl,
    timeoutLimit = 30,
    testMode = 0,
  } = params;

  // Generate hash: base64(hmac_sha256(merchant_oid + merchant_salt + price + merchant_key))
  const hashStr = merchantOid + merchantSalt + price + merchantKey;
  const paytrToken = createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64');

  const postData = new URLSearchParams({
    merchant_id: merchantId,
    user_name: userName,
    user_email: userEmail,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_oid: merchantOid,
    merchant_amount: price.toString(),
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    user_basket: '',
    debug_on: testMode.toString(),
    timeout_limit: timeoutLimit.toString(),
    merchant_key: merchantKey,
    paytr_token: paytrToken,
    no_installment: '0',
    max_installment: '0',
    currency_code: 'TL',
  });

  const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: postData.toString(),
  });

  const text = await response.text();
  const data = JSON.parse(text) as PayTRTokenResponse;

  return data;
}

/**
 * Verifies PayTR webhook hash
 * Algorithm: base64(hmac_sha256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
 */
export function verifyPayTRWebhookHash(params: {
  merchantOid: string;
  merchantSalt: string;
  status: string;
  totalAmount: string;
  merchantKey: string;
  receivedHash: string;
}): boolean {
  const { merchantOid, merchantSalt, status, totalAmount, merchantKey, receivedHash } = params;

  const hashStr = merchantOid + merchantSalt + status + totalAmount;
  const expectedHash = createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64');

  return expectedHash === receivedHash;
}

/**
 * Generates a unique merchant_oid
 * Format: PLN-{userId}-{timestamp}-{random}
 */
export function generateMerchantOid(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `PLN-${userId}-${timestamp}-${random}`;
}
