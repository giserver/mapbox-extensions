import area from '../packages/area/index';

import { describe, test, expect } from 'vitest';

describe("area", () => {
    test("normal", () => {
        const ring = [[0, 0], [0, 1], [1, 1], [1, 0]];

        const value = area(ring as any);

        expect(value).toBe(1);
    });
});