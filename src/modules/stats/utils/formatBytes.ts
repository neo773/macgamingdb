export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const bytesPerUnit = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(bytesPerUnit));
  return (
    parseFloat((bytes / Math.pow(bytesPerUnit, unitIndex)).toFixed(2)) +
    ' ' +
    sizes[unitIndex]
  );
};
