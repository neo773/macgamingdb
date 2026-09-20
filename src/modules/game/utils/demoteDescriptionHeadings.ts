const HEADING_DEMOTIONS: Record<string, string> = {
  h1: 'h3',
  h2: 'h3',
  h3: 'h4',
};

export const demoteDescriptionHeadings = (descriptionHtml: string): string =>
  descriptionHtml.replace(
    /<(\/?)(h[1-3])([^>]*)>/gi,
    (match, closingSlash: string, tag: string, attributes: string) => {
      const demoted = HEADING_DEMOTIONS[tag.toLowerCase()];
      if (demoted === undefined) {
        return match;
      }
      return `<${closingSlash}${demoted}${attributes}>`;
    },
  );
