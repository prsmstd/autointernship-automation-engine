/**
 * Student ID Generator for PrismStudio Internship Platform
 * Format: PS-Year-Month-Course-Number
 * Example: PS2506DS148 = PS + 25(2025) + 06(June) + DS(Data Science) + 148(sequence)
 */

export interface StudentIdComponents {
    prefix: string;      // "PS"
    year: string;        // "25" (last 2 digits of year)
    month: string;       // "06" (month with leading zero)
    course: string;      // "DS" (domain code)
    sequence: string;    // "148" (3-digit sequence number)
}

export const DOMAIN_CODES = {
    'WD': 'Web Development',
    'UD': 'UI/UX Design',
    'DS': 'Data Science',
    'PD': 'PCB Design',
    'EP': 'Embedded Programming',
    'FV': 'FPGA & Verilog'
} as const;

export type DomainCode = keyof typeof DOMAIN_CODES;

/**
 * Parse a student ID into its components
 */
export function parseStudentId(studentId: string): StudentIdComponents | null {
    // Format: PS2506DS148
    const regex = /^PS(\d{2})(\d{2})([A-Z]{2})(\d{3})$/;
    const match = studentId.match(regex);

    if (!match) return null;

    return {
        prefix: 'PS',
        year: match[1],
        month: match[2],
        course: match[3],
        sequence: match[4]
    };
}

/**
 * Format student ID components into a readable string
 */
export function formatStudentId(components: StudentIdComponents): string {
    return `${components.prefix}${components.year}${components.month}${components.course}${components.sequence}`;
}

/**
 * Get human-readable information from student ID
 */
export function getStudentIdInfo(studentId: string) {
    const components = parseStudentId(studentId);
    if (!components) return null;

    const year = 2000 + parseInt(components.year);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[parseInt(components.month) - 1];
    const domainName = DOMAIN_CODES[components.course as DomainCode];
    const sequenceNumber = parseInt(components.sequence);

    return {
        studentId,
        year,
        month,
        monthNumber: parseInt(components.month),
        domain: domainName,
        domainCode: components.course,
        sequenceNumber,
        formatted: `PS-${year}-${month}-${components.course}-${sequenceNumber}`,
        cohort: `${month} ${year} ${domainName}`
    };
}

/**
 * Generate next student ID for a domain (client-side helper)
 * Note: Actual generation happens in database trigger
 */
export function generateStudentIdFormat(domainCode: DomainCode, sequenceNumber: number): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month with leading zero
    const sequence = sequenceNumber.toString().padStart(3, '0'); // 3-digit sequence

    return `PS${year}${month}${domainCode}${sequence}`;
}

/**
 * Validate student ID format
 */
export function isValidStudentId(studentId: string): boolean {
    if (!studentId) return false;

    const components = parseStudentId(studentId);
    if (!components) return false;

    // Validate year (reasonable range)
    const year = parseInt(components.year);
    if (year < 20 || year > 50) return false; // 2020-2050

    // Validate month
    const month = parseInt(components.month);
    if (month < 1 || month > 12) return false;

    // Validate domain code
    if (!(components.course in DOMAIN_CODES)) return false;

    // Validate sequence
    const sequence = parseInt(components.sequence);
    if (sequence < 1 || sequence > 999) return false;

    return true;
}

/**
 * Get cohort information from student ID
 */
export function getCohortInfo(studentId: string) {
    const info = getStudentIdInfo(studentId);
    if (!info) return null;

    return {
        cohortId: `${info.year}${info.monthNumber.toString().padStart(2, '0')}${info.domainCode}`,
        cohortName: `${info.month} ${info.year} - ${info.domain}`,
        year: info.year,
        month: info.month,
        domain: info.domain,
        domainCode: info.domainCode
    };
}

/**
 * Sort student IDs chronologically
 */
export function sortStudentIds(studentIds: string[]): string[] {
    return studentIds.sort((a, b) => {
        const aComponents = parseStudentId(a);
        const bComponents = parseStudentId(b);

        if (!aComponents || !bComponents) return 0;

        // Sort by year, then month, then domain, then sequence
        const aSort = `${aComponents.year}${aComponents.month}${aComponents.course}${aComponents.sequence}`;
        const bSort = `${bComponents.year}${bComponents.month}${bComponents.course}${bComponents.sequence}`;

        return aSort.localeCompare(bSort);
    });
}

/**
 * Get statistics for student IDs
 */
export function getStudentIdStats(studentIds: string[]) {
    const validIds = studentIds.filter(isValidStudentId);
    const cohorts = new Map<string, number>();
    const domains = new Map<string, number>();
    const years = new Map<number, number>();

    validIds.forEach(id => {
        const info = getStudentIdInfo(id);
        if (!info) return;

        // Count by cohort
        const cohortKey = `${info.year}-${info.monthNumber.toString().padStart(2, '0')}-${info.domainCode}`;
        cohorts.set(cohortKey, (cohorts.get(cohortKey) || 0) + 1);

        // Count by domain
        domains.set(info.domainCode, (domains.get(info.domainCode) || 0) + 1);

        // Count by year
        years.set(info.year, (years.get(info.year) || 0) + 1);
    });

    return {
        total: validIds.length,
        invalid: studentIds.length - validIds.length,
        cohorts: Object.fromEntries(cohorts),
        domains: Object.fromEntries(domains),
        years: Object.fromEntries(years)
    };
}

// Example usage and tests
export const EXAMPLE_STUDENT_IDS = [
    'PS2506DS148', // June 2025, Data Science, #148
    'PS2506WD001', // June 2025, Web Development, #001
    'PS2507UD025', // July 2025, UI/UX Design, #025
    'PS2412EP099', // December 2024, Embedded Programming, #099
];

// Utility for displaying student ID in UI
export function displayStudentId(studentId: string, format: 'full' | 'short' | 'readable' = 'full'): string {
    if (!isValidStudentId(studentId)) return studentId;

    const info = getStudentIdInfo(studentId);
    if (!info) return studentId;

    switch (format) {
        case 'short':
            return studentId;
        case 'readable':
            return info.formatted;
        case 'full':
        default:
            return `${studentId} (${info.cohort})`;
    }
}