import { describe, expect, it } from 'vitest';

import { demoteDescriptionHeadings } from '../demoteDescriptionHeadings';

describe('demoteDescriptionHeadings', () => {
  it('should demote an h1 from a storefront description to an h3', () => {
    expect(demoteDescriptionHeadings('<h1>About the Game</h1>')).toBe(
      '<h3>About the Game</h3>',
    );
  });

  it('should demote h2 to h3 and h3 to h4', () => {
    expect(demoteDescriptionHeadings('<h2>Editions</h2><h3>Deluxe</h3>')).toBe(
      '<h3>Editions</h3><h4>Deluxe</h4>',
    );
  });

  it('should preserve attributes on the demoted tag', () => {
    expect(
      demoteDescriptionHeadings('<h1 class="bb_tag" id="x">Title</h1>'),
    ).toBe('<h3 class="bb_tag" id="x">Title</h3>');
  });

  it('should leave non-heading markup untouched', () => {
    const html = '<p>America, 1899.</p><img src="a.jpg" /><h4>Deep</h4>';
    expect(demoteDescriptionHeadings(html)).toBe(html);
  });

  it('should handle uppercase tags', () => {
    expect(demoteDescriptionHeadings('<H1>Loud</H1>')).toBe('<h3>Loud</h3>');
  });

  it('should return an empty string unchanged', () => {
    expect(demoteDescriptionHeadings('')).toBe('');
  });
});
