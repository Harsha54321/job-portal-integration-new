export const parseSalaryToLPA = (salaryString) => {
    if (!salaryString) return null;
    
    const str = String(salaryString).toLowerCase().trim();
    const cleaned = str.replace(/[₹$,]/g, '').trim();
    const match = cleaned.match(/^([\d,.]+)\s*(?:per\s*)?(month|year|annum|yr|cr|crore|lpa|lakh)?/i);
    
    if (!match) return null;
    
    let value = parseFloat(match[1].replace(/,/g, ''));
    if (isNaN(value)) return null;
    
    const unit = match[2]?.toLowerCase() || '';
    
    switch(unit) {
        case 'cr':
        case 'crore':
            return value * 100;
        case 'lpa':
        case 'lakh':
            return value;
        case 'month':
            return (value * 12) / 100000;
        case 'year':
        case 'annum':
        case 'yr':
            return value / 100000;
        default:
            if (str.includes('lpa')) return value;
            if (str.includes('lakh')) return value;
            if (str.includes('crore') || str.includes('cr')) return value * 100;
            if (str.includes('month')) return (value * 12) / 100000;
            if (str.includes('/month')) return (value * 12) / 100000;
            if (value >= 100000) return value / 100000;
            return value;
    }
};

export const parseSalaryRange = (salaryStr) => {
    if (!salaryStr) return { min: null, max: null };
    
    const str = String(salaryStr).toLowerCase().trim();
    const rangeMatch = str.match(/([\d,.]+)\s*-\s*([\d,.]+)/);
    
    if (rangeMatch) {
        const min = parseFloat(rangeMatch[1].replace(/,/g, ''));
        const max = parseFloat(rangeMatch[2].replace(/,/g, ''));
        const hasLPA = str.includes('lpa') || str.includes('lakh');
        const hasCr = str.includes('cr') || str.includes('crore');
        
        if (hasCr) {
            return { min: min * 100, max: max * 100 };
        } else if (hasLPA) {
            return { min, max };
        } else {
            return { min, max };
        }
    }
    
    const single = parseSalaryToLPA(salaryStr);
    if (single !== null) {
        return { min: single, max: single };
    }
    
    return { min: null, max: null };
};

export const isSalaryInRange = (salaryStr, minLPA, maxLPA) => {
    if (!salaryStr) return true;
    
    if (minLPA === 0 && maxLPA === 100) {
        return true;
    }
    
    if (minLPA === 0 && maxLPA === 0) {
        const salaryLPA = parseSalaryToLPA(salaryStr);
        if (salaryLPA === null) {
            const range = parseSalaryRange(salaryStr);
            if (range.min !== null && range.max !== null) {
                return range.min <= 1 && range.max <= 1;
            }
            return false;
        }
        return salaryLPA <= 1;
    }
    
    if (minLPA === 100 && maxLPA === 100) {
        const salaryLPA = parseSalaryToLPA(salaryStr);
        if (salaryLPA === null) {
            const range = parseSalaryRange(salaryStr);
            if (range.min !== null && range.max !== null) {
                return range.max >= 100;
            }
            return false;
        }
        return salaryLPA >= 100;
    }
    
    const salaryLPA = parseSalaryToLPA(salaryStr);
    
    if (salaryLPA === null) {
        const range = parseSalaryRange(salaryStr);
        if (range.min !== null && range.max !== null) {
            if (minLPA === 0 && maxLPA < 100) {
                return range.min <= maxLPA;
            }
            if (minLPA > 0 && maxLPA === 100) {
                return range.max >= minLPA;
            }
            return range.min <= maxLPA && range.max >= minLPA;
        }
        return true;
    }
    
    if (minLPA === 0 && maxLPA < 100) {
        return salaryLPA <= maxLPA;
    }
    
    if (minLPA > 0 && maxLPA === 100) {
        return salaryLPA >= minLPA;
    }
    
    return salaryLPA >= minLPA && salaryLPA <= maxLPA;
};

export const formatSalary = (salaryStr) => {
    if (!salaryStr) return 'Salary not disclosed';
    
    const lpa = parseSalaryToLPA(salaryStr);
    if (lpa === null) return salaryStr;
    
    if (lpa >= 100) {
        const croreValue = lpa / 100;
        if (Number.isInteger(croreValue)) {
            return `₹${croreValue} Cr`;
        } else {
            return `₹${croreValue.toFixed(1)} Cr`;
        }
    } else if (lpa >= 1) {
        if (Number.isInteger(lpa)) {
            return `₹${lpa} LPA`;
        } else {
            return `₹${lpa.toFixed(1)} LPA`;
        }
    } else {
        return `₹${Math.round(lpa * 100000 / 12).toLocaleString()}/month`;
    }
};

export const getSalaryDisplay = (valueInLPA) => {
    if (valueInLPA === 0) {
        return '0 LPA';
    }
    if (valueInLPA >= 100) {
        const croreValue = valueInLPA / 100;
        if (Number.isInteger(croreValue)) {
            return `${croreValue} Cr`;
        } else {
            return `${croreValue.toFixed(1)} Cr`;
        }
    } else {
        if (Number.isInteger(valueInLPA)) {
            return `${valueInLPA} LPA`;
        } else {
            return `${valueInLPA.toFixed(1)} LPA`;
        }
    }
};

export const getSalaryPercent = (value) => {
    const max = 100;
    return Math.round(((value - 0) / (max - 0)) * 100);
};

export const MAX_SALARY_LPA = 100;

export const getMaxSalaryDisplay = () => {
    return '1 Cr';
};

export const formatSalaryForDisplay = (salaryStr) => {
    if (!salaryStr) return 'Not disclosed';
    
    if (typeof salaryStr === 'string' && (salaryStr.includes('LPA') || salaryStr.includes('Cr') || salaryStr.includes('/month'))) {
        return salaryStr;
    }
    
    return formatSalary(salaryStr);
};