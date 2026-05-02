import { RefreshToken } from "./entity/refresh-token.entity";

export interface RefreshTokenRepository {
    create(userId: string, token: string, expiresAt: Date): Promise<void>;
    findValid(token: string): Promise<RefreshToken | null>;
    revoke(id: string): Promise<void>;
}