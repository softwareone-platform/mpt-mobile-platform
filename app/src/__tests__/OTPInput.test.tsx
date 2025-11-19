    
    describe('Clear Code Behavior Logic', () => {
    it('should determine when to clear code based on error state and value', () => {
        const testCases = [
            { error: true, value: '123', shouldClear: true },
            { error: true, value: '1', shouldClear: true },
            { error: true, value: '', shouldClear: false },
            { error: false, value: '123', shouldClear: false },
            { error: false, value: '', shouldClear: false },
        ];

        testCases.forEach(({ error, value, shouldClear }) => {
            const result = error && value.length > 0;
            expect(result).toBe(shouldClear);
        });
    });

    it('should handle focus behavior correctly', () => {
        const mockOnChangeText = jest.fn();

        const simulateFocus = (error: boolean, value: string) => {
            if (error && value.length > 0) {
                mockOnChangeText('');
            }
        };

        mockOnChangeText.mockClear();
        simulateFocus(true, '123');
        expect(mockOnChangeText).toHaveBeenCalledWith('');

        mockOnChangeText.mockClear();
        simulateFocus(true, '');
        expect(mockOnChangeText).not.toHaveBeenCalled();

        mockOnChangeText.mockClear();
        simulateFocus(false, '123');
        expect(mockOnChangeText).not.toHaveBeenCalled();
    });
});

describe('Digit Display Logic', () => {
    it('should determine correct digit display', () => {
        const getDigitDisplay = (digit: string, isActive: boolean): string => {
            if (digit) return digit;
            return isActive ? '|' : '';
        };

        const testCases = [
            { digit: '1', isActive: false, expected: '1' },
            { digit: '1', isActive: true, expected: '1' },
            { digit: '', isActive: false, expected: '' },
            { digit: '', isActive: true, expected: '|' },
            { digit: '0', isActive: false, expected: '0' },
            { digit: '9', isActive: true, expected: '9' },
        ];

        testCases.forEach(({ digit, isActive, expected }) => {
            expect(getDigitDisplay(digit, isActive)).toBe(expected);
        });
    });

    it('should determine active digit position correctly', () => {
        const getActivePosition = (value: string, focused: boolean, length: number) => {
            if (!focused) return -1;
            return Math.min(value.length, length - 1);
        };

        const testCases = [
            { value: '', focused: true, length: 6, expected: 0 },
            { value: '12', focused: true, length: 6, expected: 2 },
            { value: '123456', focused: true, length: 6, expected: 5 },
            { value: '12', focused: false, length: 6, expected: -1 },
            { value: '1234', focused: true, length: 4, expected: 3 },
        ];

        testCases.forEach(({ value, focused, length, expected }) => {
            expect(getActivePosition(value, focused, length)).toBe(expected);
        });
    });
});