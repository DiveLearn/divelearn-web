// /inmersion-ans-c01        → redirige a /inmersion-ans-c01/
// /inmersion-ans-c01/       → sirve /inmersion-ans-c01/index.html
// www.divelearn.cloud/...  → redirige a divelearn.cloud/...
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var host = request.headers.host ? request.headers.host.value : "";
  if (host.indexOf("www.") === 0) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://" + host.slice(4) + uri } }
    };
  }
  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (!uri.split("/").pop().includes(".")) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: uri + "/" } }
    };
  }
  return request;
}
