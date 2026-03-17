import { NextResponse } from 'next/server';
import { EXPENSE_CATEGORY_VALUES, EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/types';

type ParseRequest = {
  text: string;
  targetForm?: 'onboarding' | 'expense';
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ParseRequest;
    const { text, targetForm = 'onboarding' } = body || {};

    console.info('[parse-fields] incoming request', { textLength: text?.length ?? 0, targetForm });

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // --- API keys and model setup ---
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY1;
    const project = process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

    if (!apiKey || !project) {
      return NextResponse.json(
        { error: 'Missing API key or project id: set GOOGLE_API_KEY or GEMINI_API_KEY1 and GOOGLE_PROJECT_ID in server env' },
        { status: 500 }
      );
    }

    // --- Categories & Instructions ---
    const allowedCategories = EXPENSE_CATEGORY_VALUES;

    const instructions = {
      onboarding: `Produce a JSON object with keys: role (Student), income (number), fixedExpenses (array of {name,category,amount,timelineMonths,startDate?}). Parse dates as ISO strings. Only output JSON, no explanation. If a field is missing, omit it.`,
      expense: `You are a financial parsing assistant. Extract expense details from the following receipt/text.
        Produce a JSON object with these exact keys:
        - description: A concise summary of the transaction (2-5 words).
        - amount: The total amount paid as a number. Look for "Total", "Net Amount", "Grand Total", or the largest numeric value near the bottom. Strip any currency symbols (₹, $, etc).
        - category: One of ${allowedCategories.join(', ')}.
        - date: The transaction date in ISO format (YYYY-MM-DD), if identifiable.

        IMPORTANT:
        - If the text is messy OCR, focus on finding the merchant name and the total price.
        - OCR often misreads the currency symbol (₹) as the digit "2" or letter "z". If an amount starts with a "2" that feels extra (e.g., "2 29,497" or "229497"), ignore the leading "2".
        - DO NOT use Transaction IDs, PNR numbers, or GSTINs as the amount. These are usually 10+ digits long.
        - Look for "TOTAL" or "Balance Due" at the very bottom of the document as the final amount.
        - The category MUST be from: ${allowedCategories.join(' | ')}.
        - If unsure, Use "Other" for category.
        - Output ONLY valid JSON.`,
    } as const;

    const prompt = `${instructions[targetForm as keyof typeof instructions]}\n\nInput: "${text.replace(/"/g, '\\"')}` + '"';

    // --- API Configuration (Generative Models endpoint) ---
    const API_BASE = process.env.PARSE_FIELDS_API_BASE || 'https://generativelanguage.googleapis.com/v1';
    const primaryModel = (process.env.PARSE_FIELDS_MODEL || 'gemini-2.0-flash').replace(/^models\//, '');
    const urlForModel = (modelId: string) => `${API_BASE}/models/${modelId}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    // --- Fallback logic helpers ---
    const extractNumber = (s: string | undefined) => {
      if (!s) return null;

      const cleanVal = (raw: string) => {
        let valStr = raw.replace(/,/g, '');
        // Strip a likely misread leading currency symbol (e.g., '2' or 'z' from '₹')
        // Only if stripping it results in a number that is still reasonably large (e.g., 3+ digits)
        if (valStr.length >= 5 && (valStr.startsWith('2') || valStr.toLowerCase().startsWith('z'))) {
          const alternative = valStr.substring(1);
          if (alternative.length >= 4) return Number(alternative);
        }
        return Number(valStr);
      };

      // 1. Try to find a number explicitly labeled as Total/Due/Grand Total/Amount Paid/Payable
      // Search for the LAST occurrence of these keywords to get the final total at the bottom
      const totalKeywords = ['total', 'payable', 'due', 'fare', 'paid', 'amount'];

      let bestFallback = null;
      for (const kw of totalKeywords) {
        // Look for keywords followed by a number, allowing for some text/symbols in between
        const regex = new RegExp(`${kw}[^\\d\\n]{0,20}(\\d{1,3}(?:[\\d,])*(?:\\.\\d{1,2})?)`, 'gi');
        const matches = Array.from(s.matchAll(regex));
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1]; // Use the one furthest down
          const val = cleanVal(lastMatch[1]);
          if (!isNaN(val) && val > 0 && val < 500000) {
            // If we found a "Total" or "Due", it's likely the final amount
            if (kw === 'total' || kw === 'due' || kw === 'payable') return val;
            bestFallback = val;
          }
        }
      }
      if (bestFallback) return bestFallback;

      // 2. Fallback: Find all numbers, but EXCLUDE anything that looks like an ID
      const nums = Array.from(s.matchAll(/(\d{1,3}(?:[\d,]*)(?:\.\d+)?)/g))
        .map((m) => m[0])
        .filter(n => n.replace(/[,.]/g, '').length <= 8) // Exclude likely IDs
        .map(n => cleanVal(n));

      const sensible = nums.filter((n) => !Number.isNaN(n) && isFinite(n) && n > 0 && n < 100000);
      return sensible.length > 0 ? sensible[sensible.length - 1] : null;
    };

    const ensureAmountFromText = (rawText: string) => {
      const maybe = extractNumber(rawText);
      if (maybe != null) console.info('[parse-fields] ensureAmountFromText extracted', { value: maybe });
      return maybe;
    };

    // --- Call the Generative Model ---
    const callModel = async (modelId: string) => {
      const tryUrl = urlForModel(modelId);
      console.info('[parse-fields] calling model', tryUrl);
      try {
        const r = await fetch(tryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.0, maxOutputTokens: 800 },
          }),
        });
        const j = await r.json().catch(() => null);
        return { resp: r, json: j } as const;
      } catch (e) {
        return { resp: null, json: String(e) } as const;
      }
    };

    let resp: Response | null = null;
    let json: Record<string, unknown> | null = null;
    let output = '';

    const primary = await callModel(primaryModel);
    resp = primary.resp;
    json = primary.json;

    console.info('[parse-fields] model attempt', { model: primaryModel, status: resp?.status ?? 'fetch-error' });
    console.info('[parse-fields] model response body', JSON.stringify(json));

    // --- Handle model failure (try fallback models) ---
    if (!resp || !resp.ok) {
      let fallbackList =
        (process.env.PARSE_FIELDS_MODEL_FALLBACKS || 'models/gemini-1.5-pro,models/gemini-1.0-pro')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      for (const alt of fallbackList) {
        const altId = alt.replace(/^models\//, '');
        console.info('[parse-fields] trying fallback model', altId);
        const attempt = await callModel(altId);
        console.info('[parse-fields] fallback attempt result', {
          model: alt,
          status: attempt.resp?.status ?? 'fetch-error',
        });
        if (attempt.resp && attempt.resp.ok) {
          resp = attempt.resp;
          json = attempt.json;
          console.info('[parse-fields] fallback model succeeded', alt);
          break;
        }
      }
    }

    // --- Fallback handling ---
    if (!resp || !resp.ok) {
      console.error('[parse-fields] generative API failed', resp?.status ?? 'no-response', json);
      const fallbackParsed: Record<string, unknown> = {};
      const fallbackAmount = ensureAmountFromText(text);
      if (fallbackAmount != null) fallbackParsed.amount = fallbackAmount;
      const cleaned = text.replace(/[\n\r]/g, ' ').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      fallbackParsed.description = cleaned.split(' ').slice(0, 6).join(' ') || 'Expense';
      fallbackParsed.category = 'Other';
      fallbackParsed._amountSource = fallbackParsed.amount != null ? 'fallback' : 'none';
      return NextResponse.json(
        { error: 'Generative API error', parsed: fallbackParsed, raw: '', modelResponse: json },
        { status: 200 }
      );
    }

    // --- Extract model output ---
    output =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      json?.candidates?.[0]?.content ??
      '';

    // --- Parse JSON output ---
    let parsed: Record<string, unknown> = {};
    try {
      const match = output.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    } catch (e) {
      parsed = {};
    }

    // --- Normalize values ---
    if (parsed.description && typeof parsed.description === 'string') {
      const words = parsed.description.trim().split(/\s+/);
      if (words.length > 6) parsed.description = words.slice(0, 6).join(' ');
    }

    const parsedAmount = parsed?.amount ?? parsed?.total ?? parsed?.Total;
    let _amountSource: 'model' | 'fallback' | 'none' = 'model';

    if (parsedAmount == null || Number.isNaN(Number(parsedAmount))) {
      const fallback1 = ensureAmountFromText(output);
      const fallback2 = ensureAmountFromText(text);
      const finalAmount = fallback1 ?? fallback2 ?? null;
      if (finalAmount != null) {
        parsed.amount = finalAmount;
        _amountSource = 'fallback';
      } else {
        _amountSource = 'none';
      }
    } else {
      parsed.amount = Number(parsedAmount);
    }

    parsed._amountSource = _amountSource;

    if ((!parsed.description || parsed.description.trim() === '') && text) {
      const cleaned = text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      parsed.description = cleaned.split(' ').slice(0, 6).join(' ') || 'Expense';
    }

    // --- Normalize category ---
    const normalizeCategory = (rawCat: string | undefined): ExpenseCategory => {
      if (!rawCat) return EXPENSE_CATEGORIES.OTHER;
      const lower = rawCat.toLowerCase();
      if (/food|restaurant|dine|cafe|meal|canteen/.test(lower)) return EXPENSE_CATEGORIES.FOOD;
      if (/taxi|uber|ola|rapido|bus|metro|train|transport|ride/.test(lower)) return EXPENSE_CATEGORIES.TRANSPORT;
      if (/hostel|room|rent|pg|accommodation/.test(lower)) return EXPENSE_CATEGORIES.HOSTEL;
      if (/tuition|course|study|education|school|college|book|stationery/.test(lower)) return EXPENSE_CATEGORIES.EDUCATION;
      if (/netflix|spotify|subscription|app|software|saas/.test(lower)) return EXPENSE_CATEGORIES.SUBSCRIPTIONS;
      if (/doctor|hospital|medicine|clinic|health|pharmacy/.test(lower)) return EXPENSE_CATEGORIES.HEALTH;
      if (/clothes|clothing|apparel|fashion/.test(lower)) return EXPENSE_CATEGORIES.CLOTHING;
      if (/fest|event|college event|tickets/.test(lower)) return EXPENSE_CATEGORIES.FEST;
      if (/movie|cinema|entertainment|hangout|outing|games/.test(lower)) return EXPENSE_CATEGORIES.ENTERTAINMENT;
      if (/recharge|mobile|data pack|prepaid|postpaid/.test(lower)) return EXPENSE_CATEGORIES.RECHARGE;
      if (/family|parents|home transfer|sent home/.test(lower)) return EXPENSE_CATEGORIES.FAMILY;
      return EXPENSE_CATEGORIES.OTHER;
    };

    parsed.category = normalizeCategory(parsed.category);

    return NextResponse.json({ parsed, raw: output, modelResponse: json });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[parse-fields] fatal error', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}