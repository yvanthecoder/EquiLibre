const parseCookies = (cookieHeader) => {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce((acc, part) => {
        const [rawKey, ...rest] = part.trim().split('=');
        if (!rawKey) return acc;
        const value = rest.join('=');
        acc[rawKey] = decodeURIComponent(value || '');
        return acc;
    }, {});
};

module.exports = {
    parseCookies
};
