import { getMigrationNames } from './migration-runner';

describe('getMigrationNames', () => {
  it('keeps only SQL migrations and runs them in filename order', () => {
    expect(
      getMigrationNames([
        'notes.txt',
        '202610160002-fix-active-unique-indexes.sql',
        '202610160001-add-guru-pengampu-to-mata-pelajaran.sql',
      ]),
    ).toEqual([
      '202610160001-add-guru-pengampu-to-mata-pelajaran.sql',
      '202610160002-fix-active-unique-indexes.sql',
    ]);
  });
});
