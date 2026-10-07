import { describe, expect, it } from 'vitest';
import { newId, UuidSchema } from './ids.js';

describe('newId', () => {
  it('genera UUIDv7 válidos', () => {
    expect(UuidSchema.safeParse(newId()).success).toBe(true);
  });

  it('genera ids ordenados por fecha de creación', () => {
    const ids = Array.from({ length: 50 }, () => newId());
    expect([...ids].sort()).toEqual(ids);
  });

  it('rechaza un UUIDv4', () => {
    expect(UuidSchema.safeParse('9b2f4c1e-3a5d-4e8f-9c7b-1d2e3f4a5b6c').success).toBe(false);
  });
});
