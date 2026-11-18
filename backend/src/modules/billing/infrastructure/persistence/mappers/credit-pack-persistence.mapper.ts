import { CreditPack } from '../../../domain/entities/credit-pack.entity';
import { CreditPackDocument } from '../schemas/credit-pack.schema';

export class CreditPackPersistenceMapper {
    public static toDomain(raw: CreditPackDocument): CreditPack {
        return new CreditPack({
            id: raw._id ? raw._id.toString() : '',
            name: raw.name,
            code: raw.code,
            creditsCount: raw.creditsCount,
            price: {
                amount: raw.price.amount,
                currency: raw.price.currency,
            },
            offers: (raw.offers ?? []).map((o) => ({
                id: o.id,
                name: o.name ?? o.code,
                code: o.code ?? o.name,
                discountPercentage: o.discountPercentage,
                validFrom: o.validFrom,
                validUntil: o.validUntil,
                isActive: o.isActive,
            })),
            badge: raw.badge ?? null,
            sortOrder: raw.sortOrder ?? 0,
            isListed: raw.isListed ?? true,
            isActive: raw.isActive ?? true,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    public static toDomainList(rawList: CreditPackDocument[]): CreditPack[] {
        return rawList.map((raw) => this.toDomain(raw));
    }

    public static toPersistence(entity: CreditPack): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            _id: data.id,
            name: data.name,
            normalizedName: entity.normalizedName,
            code: data.code,
            creditsCount: data.creditsCount,
            price: {
                amount: data.price.amount,
                currency: data.price.currency,
            },
            offers: data.offers.map((o) => ({
                id: o.id,
                name: o.name,
                code: o.name,
                discountPercentage: o.discountPercentage,
                validFrom: o.validFrom,
                validUntil: o.validUntil,
                isActive: o.isActive,
            })),
            badge: data.badge,
            sortOrder: data.sortOrder,
            isListed: data.isListed,
            isActive: data.isActive,
        };
    }
}
