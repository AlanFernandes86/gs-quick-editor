const getUrl = window.location;
const baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

console.log(baseUrl);
console.dir(getUrl);