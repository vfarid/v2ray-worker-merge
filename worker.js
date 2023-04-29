export default {
  async fetch(request) {
    var url = new URL(request.url);
    var newUrl = new URL("https://" + url.pathname.replace(/^\/|\/$/g, ""));
    return fetch(new Request(newUrl, request));
  }
}
