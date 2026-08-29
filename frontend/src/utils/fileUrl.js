export const getAuthenticatedFileUrl = (spacesUrl) => {
  if (!spacesUrl) return '';

  if (spacesUrl.startsWith('http')) {
    const urlParts = spacesUrl.split('/');
    const folder = urlParts[urlParts.length - 2];
    const filename = urlParts[urlParts.length - 1];
    const token = localStorage.getItem('token');
    return `/api/files/${folder}/${filename}?token=${token}`;
  }

  return spacesUrl;
};
