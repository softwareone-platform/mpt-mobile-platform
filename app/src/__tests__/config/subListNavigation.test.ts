import {
  getAgreementSubList,
  getCertificateSubList,
  getAccountSubList,
} from '@/config/subListsNavigation';

describe('subListsNavigation (queries)', () => {
  const id = 'TEST-ID-123';

  describe('getAgreementSubList', () => {
    it('generates correct queries', () => {
      const result = getAgreementSubList(id);

      expect(result.find((i) => i.name === 'subscriptions')?.query).toBe(
        `&eq(agreement.id,"${id}")&filter(group.buyers)`,
      );

      expect(result.find((i) => i.name === 'invoices')?.query).toBe(
        `&eq(agreement.id,"${id}")&order=-audit.created.at`,
      );

      expect(result.find((i) => i.name === 'statements')?.query).toBe(
        `&eq(agreement.id,"${id}")&order=-audit.created.at`,
      );
    });
  });

  describe('getCertificateSubList', () => {
    it('generates correct queries', () => {
      const result = getCertificateSubList(id);

      expect(result.find((i) => i.name === 'enrollments')?.query).toBe(
        `&and(eq(certificate.id,"${id}"),ne(status,"Deleted"))`,
      );

      expect(result.find((i) => i.name === 'agreements')?.query).toBe(
        `&any(certificates,eq(id, "${id}"))`,
      );
    });
  });

  describe('getAccountSubList', () => {
    it('generates correct queries', () => {
      const result = getAccountSubList(id);

      expect(result.find((i) => i.name === 'buyers')?.query).toBe(
        `&and(ne(status,"Deleted"),eq(account.id,"${id}"))&order=name`,
      );

      expect(result.find((i) => i.name === 'licensees')?.query).toBe(
        `&eq(account.id,"${id}")&order=name`,
      );
    });
  });
});
