import { describe, it, expect } from 'vitest';
import { DEALS, ACTIVITIES, PARTNER_DETAILS, DEAL_STATS, MDF_STATS, INCENTIVE_PROGRAMS } from '../constants';
import { IMPORTED_PARTNERS } from '../data/importedPartners';

describe('Constants / Mock Data', () => {
  it('IMPORTED_PARTNERS is a non-empty array', () => {
    expect(Array.isArray(IMPORTED_PARTNERS)).toBe(true);
    expect(IMPORTED_PARTNERS.length).toBeGreaterThan(0);
  });

  it('each partner has required fields', () => {
    for (const p of IMPORTED_PARTNERS) {
      expect(typeof p.id).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(typeof p.tier).toBe('string');
      expect(typeof p.status).toBe('string');
      expect(typeof p.winRate).toBe('number');
    }
  });

  it('DEALS is a non-empty array', () => {
    expect(Array.isArray(DEALS)).toBe(true);
    expect(DEALS.length).toBeGreaterThan(0);
  });

  it('each deal has lifecycle events', () => {
    for (const d of DEALS) {
      expect(Array.isArray(d.lifecycle)).toBe(true);
      expect(d.lifecycle.length).toBeGreaterThan(0);
      for (const event of d.lifecycle) {
        expect(typeof event.stage).toBe('string');
        expect(typeof event.date).toBe('string');
        expect(typeof event.description).toBe('string');
        expect(typeof event.actor).toBe('string');
      }
    }
  });

  it('DEAL_STATS has all required fields', () => {
    expect(typeof DEAL_STATS.yearNew).toBe('number');
    expect(typeof DEAL_STATS.quarterNew).toBe('number');
    expect(typeof DEAL_STATS.monthNew).toBe('number');
    expect(typeof DEAL_STATS.weekNew).toBe('number');
    expect(typeof DEAL_STATS.rejected).toBe('number');
    expect(typeof DEAL_STATS.closed).toBe('number');
  });

  it('PARTNER_DETAILS has nested objects', () => {
    expect(PARTNER_DETAILS.pipeline).toBeDefined();
    expect(PARTNER_DETAILS.mdf).toBeDefined();
    expect(PARTNER_DETAILS.enablement).toBeDefined();
    expect(Array.isArray(PARTNER_DETAILS.followUps)).toBe(true);
    expect(Array.isArray(PARTNER_DETAILS.topProjects)).toBe(true);
  });

  it('ACTIVITIES has required fields', () => {
    expect(Array.isArray(ACTIVITIES)).toBe(true);
    for (const a of ACTIVITIES) {
      expect(['signing', 'registration', 'visit', 'milestone']).toContain(a.type);
      expect(typeof a.title).toBe('string');
      expect(typeof a.description).toBe('string');
      expect(typeof a.date).toBe('string');
    }
  });

  it('MDF_STATS has valid values', () => {
    expect(MDF_STATS.annualQuota).toBeGreaterThan(0);
    expect(MDF_STATS.usedAmount).toBeGreaterThanOrEqual(0);
    expect(MDF_STATS.remainingAmount).toBeGreaterThanOrEqual(0);
  });

  it('INCENTIVE_PROGRAMS contains both Active and Ended programs', () => {
    const statuses = INCENTIVE_PROGRAMS.map(p => p.status);
    expect(statuses).toContain('Active');
    expect(statuses).toContain('Ended');
  });
});
