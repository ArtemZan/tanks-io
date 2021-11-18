function SetParam(url, key, value) {
    if(typeof value !== "string")
        value = JSON.stringify(value);

    const current = url.match(RegExp(`(\\?|&)${key}=[^&\\s]+`));

    if (current !== null) {
        const separator = current[0][0]; // expected '?' or '&'
        const res = current[0].replace('=' + current[0].substring(key.length + 1), '=' + value);
        return res;
    }

    if (url.lastIndexOf("?") === -1) {
        let res = url;

        if (url[url.length - 1] === '/') {
            res = res.slice(0, res.length - 1);
        }

        res += `?${key}=${value}`;

        return res;
    }
    
    return url + `&${key}=${value}`;
}

function GetParam(url, key)
{
    const match = url.match(RegExp(`(\\?|&)${key}=[^&\\s]+`));

    if(match !== null)
    {
        return match[0].slice(key.length + 2);
    }
}

export {
    SetParam,
    GetParam
}