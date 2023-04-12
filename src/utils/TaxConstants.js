export const taxConstants = {
    '2023/24': {
        personalAllowance: {
            basicAllowance: 12570,
            taperThreshold: 100000,
        },
        nationalInsurance: {
            lowerEarningsLimit: 6396,
            primaryThreshold: 12570,
            secondaryThreshold: 9100,
            upperEarningsLimit: 50270,
            employerRates: [0.138, 0.138],
            employeeRates: [0.12, 0.02]
        },
        studentLoan: {
            defaultRate: 0.09,
            postgradRate: 0.06,
            thresholds: {
                plan1: 22015,
                plan2: 27295,
                plan4: 27660,
                plan5: 25000,
                postgrad: 21000
            },
        },
        incomeTax: {
            scotland: [
                [0.19, 2162],
                [0.20, 13118],
                [0.21, 31092],
                [0.42, 125140],
                [0.47, Infinity]
            ],
            restOfUK: [
                [0.20, 37700],
                [0.40, 125140],
                [0.45, Infinity]
            ],
        }
    },
    // Add more tax years if needed
};
