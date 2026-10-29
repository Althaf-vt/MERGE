export class GeoUtil {

    // Calculates the great-circle distance between two points on the Earth's surface.
    // Coordinates must be passed as [longitude, latitude] to match GeoJSON standards.
    public static calculateHaversineDistanceKm(
        lng1: number, lat1: number,
        lng2: number, lat2: number
    ): number {
        const R = 6371 // Earth's mean radius in Km
        const dLat = this._toRadians(lat2 - lat1);
        const dLon = this._toRadians(lng2 - lng1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat) +
            Math.cos(this._toRadians(lat1)) * Math.cos(this._toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    private static _toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}