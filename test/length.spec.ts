import length from '../packages/length/index';

import { describe, test, expect } from 'vitest';

describe("length", () => {
    test("normal", () => {
        const ring = [[0, 0], [0, 1], [1, 1], [1, 0]];

        const value = length(ring as any);

        expect(value).toBe(3);
    });
});