
interface RateLimitEntry {
    attempts: number;
    firstAttempt: number;
    blocked: boolean;
    blockedUntil?: number;
}

export class RateLimitService {
    private attempts: Map<string, RateLimitEntry> = new Map();
    private windowMs: number;
    private maxAttempts: number;
    private blockedDuration: number = 15 * 60 * 1000; 

    constructor(windowMs: number = 15 * 60 * 1000, maxAttempts: number = 5) {
        this.windowMs = windowMs;
        this.maxAttempts = maxAttempts;

        setInterval(() => this.cleanup(), 60000);
    }

    public registerFailedAttempt(identifier: string): boolean {
        const now = Date.now();
        const entry = this.attempts.get(identifier);

        if (entry && entry.blocked && entry.blockedUntil) {
            if (now < entry.blockedUntil) {
                return false;
            } else {
                this.attempts.delete(identifier);
                return true;
            }
        }

        if (!entry || now - entry.firstAttempt > this.windowMs) {
            this.attempts.set(identifier, {
                attempts: 1,
                firstAttempt: now,
                blocked: false
            });
            return true;
        }

        entry.attempts++;

        if (entry.attempts > this.maxAttempts) {
            entry.blocked = true;
            entry.blockedUntil = now + this.blockedDuration;
            return false;
        }

        return true;
    }

    public resolveAttempt(identifier: string): void {
        this.attempts.delete(identifier);
    }

    public getAttempts(identifier: string): RateLimitEntry | undefined {
        return this.attempts.get(identifier);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.attempts.entries()) {

            if (now - entry.firstAttempt > this.windowMs && !entry.blocked) {
                this.attempts.delete(key);
            }

            if (entry.blocked && entry.blockedUntil && now > entry.blockedUntil) {
                this.attempts.delete(key);
            }
        }
    }

    public resetAttempts(identifier: string): void {
        this.attempts.delete(identifier);
    }

    public getStats() {
        let blocked = 0;
        let attempting = 0;

        for (const entry of this.attempts.values()) {
            if (entry.blocked) blocked++;
            if (!entry.blocked && entry.attempts > 0) attempting++;
        }

        return {
            totalTracked: this.attempts.size,
            blocked,
            attempting,
            windowMs: this.windowMs,
            maxAttempts: this.maxAttempts
        };
    }
}

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000");
const maxAttempts = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || "5");

export const rateLimitService = new RateLimitService(windowMs, maxAttempts);
