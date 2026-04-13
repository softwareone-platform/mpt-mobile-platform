import { getAgreementsSubList, getCertificatesSubList } from '@/config/subListsNavigation';

describe('subListsNavigation (queries only)', () => {
  const id = 'TEST-ID-123';

  describe('getAgreementsSubList', () => {
    it('generates correct queries', () => {
      const result = getAgreementsSubList(id);

      expect(result).toHaveLength(3);

      expect(result.map((item) => item.query)).toEqual([
        `&agreement.id="${id}"&filter(group.buyers)`,
        `&eq(agreement.id,"${id}")&order=-audit.created.at`,
        `&eq(agreement.id,"${id}")&order=-audit.created.at`,
      ]);
    });

    it('injects id into all queries', () => {
      const result = getAgreementsSubList(id);

      result.forEach((item) => {
        expect(item.query).toContain(`"${id}"`);
      });
    });
  });

  describe('getCertificatesSubList', () => {
    it('generates correct queries', () => {
      const result = getCertificatesSubList(id);

      expect(result).toHaveLength(2);

      expect(result.map((item) => item.query)).toEqual([
        `&and(eq(certificate.id,"${id}"),ne(status,"Deleted"))`,
        `&any(certificates,eq(id, "${id}"))`,
      ]);
    });

    it('injects id into all queries', () => {
      const result = getCertificatesSubList(id);

      result.forEach((item) => {
        expect(item.query).toContain(`"${id}"`);
      });
    });
  });
});
