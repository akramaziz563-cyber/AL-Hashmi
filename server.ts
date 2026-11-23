import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Read public Firebase web config for ID token verification (no IAM required)
let firebaseApiKey = '';
try {
  const fbConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(fbConfigPath)) {
    const parsed = JSON.parse(fs.readFileSync(fbConfigPath, 'utf-8'));
    firebaseApiKey = parsed.apiKey || '';
  }
} catch {
  firebaseApiKey = '';
}

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory rate limiting store for public endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Verify Firebase ID token via Identity Toolkit lookup (works across all tiers without IAM)
async function verifyFirebaseStaffToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const idToken = authHeader.slice(7).trim();
    if (!idToken || !firebaseApiKey) {
      res.status(401).json({ error: 'Invalid authentication configuration.' });
      return;
    }

    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyRes.ok) {
      res.status(401).json({ error: 'Invalid or expired session token.' });
      return;
    }

    const data = (await verifyRes.json()) as {
      users?: Array<{ localId: string; email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user || !user.emailVerified) {
      res.status(403).json({ error: 'Verified email account required.' });
      return;
    }

    (req as Request & { authUser?: { uid: string; email: string } }).authUser = {
      uid: user.localId,
      email: user.email || '',
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unable to verify authentication session.' });
  }
}

const inquiryNotifySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(5).max(2000),
  propertyId: z.string().trim().max(128).optional().nullable(),
  propertyTitle: z.string().trim().max(160).optional().nullable(),
  sourcePage: z.string().trim().min(1).max(160),
  website: z.string().max(100).optional(), // honeypot field
});

const mapsInsightSchema = z.object({
  query: z.string().trim().min(3).max(240),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
});

const imageStudioSchema = z.object({
  prompt: z.string().trim().min(5).max(800),
  aspectRatio: z.enum(['1:1', '4:3', '16:9', '3:4']).default('4:3'),
  sourceImageBase64: z.string().max(12_000_000).optional().nullable(),
  sourceMimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional().nullable(),
});

const uploadSchema = z.object({
  dataUrl: z.string().min(30).max(20_500_000),
  fileName: z.string().trim().min(1).max(120).optional(),
});

async function sendOwnerNotificationEmail(payload: z.infer<typeof inquiryNotifySchema>) {
  const ownerEmail = process.env.OWNER_EMAIL?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!ownerEmail || !resendKey) {
    return { delivered: false, reason: 'Email provider not configured' };
  }

  const subject = payload.propertyTitle
    ? `New property inquiry: ${payload.propertyTitle}`
    : `New general inquiry from ${payload.name}`;

  const textBody = [
    `Al Hashmi Real Estate Agency Sahiwal — New Inquiry`,
    ``,
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email || 'Not provided'}`,
    `Property: ${payload.propertyTitle || 'General Inquiry'}`,
    `Source Page: ${payload.sourcePage}`,
    ``,
    `Message:`,
    payload.message,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Al Hashmi Real Estate <onboarding@resend.dev>',
      to: [ownerEmail],
      subject,
      text: textBody,
    }),
  });

  if (!response.ok) {
    return { delivered: false, reason: `Resend HTTP ${response.status}` };
  }
  return { delivered: true };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '22mb' }));

  // Serve uploaded property/gallery images safely
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: '7d',
      fallthrough: false,
    })
  );
  app.use('/uploads', (_err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({ error: 'Image not found.' });
  });

  // Dynamic robots.txt and sitemap.xml
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const staticPaths = ['/', '/properties', '/gallery', '/about', '/services', '/contact'];
    const urls = staticPaths
      .map(
        (p) =>
          `<url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq><priority>${
            p === '/' ? '1.0' : '0.8'
          }</priority></url>`
      )
      .join('');
    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
      );
  });

  // Inquiry validation, anti-spam honeypot, rate limiting, and owner email notification
  app.post('/api/inquiries', async (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(`inquiry:${clientIp}`, 8, 10 * 60 * 1000)) {
      res.status(429).json({
        error: 'Too many inquiry requests. Please wait a few minutes or call 0300 8620646 directly.',
      });
      return;
    }

    const parsed = inquiryNotifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Please check your name, phone number, and message.',
        issues: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Honeypot check: silently accept to confuse bots without sending notifications
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      res.status(200).json({ ok: true, spamFiltered: true });
      return;
    }

    try {
      const notification = await sendOwnerNotificationEmail(parsed.data);
      res.status(200).json({ ok: true, emailDelivered: notification.delivered });
    } catch {
      res.status(200).json({ ok: true, emailDelivered: false });
    }
  });

  // Safe image upload endpoint (staff-authenticated, magic-byte & size validated)
  app.post('/api/uploads', verifyFirebaseStaffToken, async (req, res) => {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid image payload.' });
      return;
    }

    const match = parsed.data.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      res.status(400).json({ error: 'Only JPG, PNG, and WebP images are supported.' });
      return;
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 15 * 1024 * 1024) {
      res.status(413).json({ error: 'Image exceeds the 15 MB limit.' });
      return;
    }

    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `prop-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, fileName);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid upload path.' });
      return;
    }

    fs.writeFileSync(targetPath, buffer);
    res.status(201).json({ url: `/uploads/${fileName}` });
  });

  // Google Maps Grounding via gemini-4-hydrogen
  app.post('/api/ai/maps-insights', async (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(`maps:${clientIp}`, 20, 10 * 60 * 1000)) {
      res.status(429).json({ error: 'Rate limit reached for neighborhood insights. Please try shortly.' });
      return;
    }

    const parsed = mapsInsightSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please provide a valid location query.' });
      return;
    }

    try {
      const ai = getGenAIClient();
      const latLng =
        typeof parsed.data.lat === 'number' && typeof parsed.data.lng === 'number'
          ? { latitude: parsed.data.lat, longitude: parsed.data.lng }
          : { latitude: 31.6915, longitude: 74.294 }; // Ferozewala / Rana Town corridor default

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Provide concise, verified neighborhood & accessibility information for a property buyer looking at: ${parsed.data.query}. Mention nearby main roads, schools, hospitals, mosques, and commercial markets based strictly on Google Maps data.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng,
            },
          },
        },
      });

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const places: Array<{ title: string; uri: string; snippets: string[] }> = [];

      for (const chunk of rawChunks as Array<{
        maps?: {
          uri?: string;
          title?: string;
          placeAnswerSources?: { reviewSnippets?: Array<{ content?: string }> };
        };
      }>) {
        if (chunk.maps?.uri && chunk.maps?.title) {
          const snippets =
            chunk.maps.placeAnswerSources?.reviewSnippets
              ?.map((s) => s.content)
              .filter((c): c is string => Boolean(c)) ?? [];
          places.push({
            title: chunk.maps.title,
            uri: chunk.maps.uri,
            snippets,
          });
        }
      }

      res.status(200).json({
        summary: response.text ?? 'Neighborhood summary retrieved from Google Maps.',
        places,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to fetch Google Maps insights.';
      res.status(502).json({ error: message });
    }
  });

  // AI Image Studio via gemini-nano-banana-2.1 (staff-only)
  app.post('/api/ai/image-studio', verifyFirebaseStaffToken, async (req, res) => {
    const parsed = imageStudioSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please provide a descriptive prompt (at least 5 characters).' });
      return;
    }

    try {
      const ai = getGenAIClient();
      const parts: Array<
        { text: string } | { inlineData: { data: string; mimeType: string } }
      > = [];

      if (parsed.data.sourceImageBase64 && parsed.data.sourceMimeType) {
        parts.push({
          inlineData: {
            data: parsed.data.sourceImageBase64,
            mimeType: parsed.data.sourceMimeType,
          },
        });
      }

      parts.push({
        text: `${parsed.data.prompt}. Architectural real estate photography style, natural lighting, crisp realism, no text or watermarks.`,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: parsed.data.aspectRatio,
            imageSize: '1K',
          },
        },
      });

      let generatedDataUrl = '';
      let note = '';
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          generatedDataUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          note = part.text;
        }
      }

      if (!generatedDataUrl) {
        res.status(502).json({ error: note || 'No image was returned by the model.' });
        return;
      }

      res.status(200).json({ dataUrl: generatedDataUrl, note });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image generation failed.';
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.includes('billing') || msg.includes('PERMISSION_DENIED')) {
        res.status(402).json({
          error:
            'AI Image Studio (gemini-nano-banana-2.1) requires a billing-enabled Gemini API key in Settings > Secrets.',
        });
        return;
      }
      res.status(502).json({ error: msg });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al Hashmi Real Estate server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
