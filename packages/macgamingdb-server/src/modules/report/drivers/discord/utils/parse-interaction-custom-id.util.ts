type ParsedInteractionCustomId = { action: string; reviewId: string };

export const parseInteractionCustomId = (
  customId: string,
): ParsedInteractionCustomId => {
  const separatorIndex = customId.indexOf(':');
  if (separatorIndex === -1) {
    return { action: customId, reviewId: '' };
  }
  return {
    action: customId.slice(0, separatorIndex),
    reviewId: customId.slice(separatorIndex + 1),
  };
};
