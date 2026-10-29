export class DateUtil {
    // Calculates exact chronological age from a date of birth.
    // Accounts for day and month boundaries accurately without leap year drift.
    public static calculateAge(dob: string | Date | null | undefined): number | null {
        if (!dob) return null;
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
        const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
            age--;
        }

        return age >= 0 ? age : null;
    }
}

