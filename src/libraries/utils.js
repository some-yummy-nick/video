function hasClass(el, cls) {
  return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
}

/** @enum {number} */
var READY_STATE = {
  'UNSENT': 0,
  'OPENED': 1,
  'HEADERS_RECEIVED': 2,
  'LOADING': 3,
  'DONE': 4
};

function getXmlHttpRequest() {
  if (window.XMLHttpRequest) {
    try {
      return new XMLHttpRequest();
    } catch (e) {}
  } else if (window.ActiveXObject) {
    try {
      return new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {}
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e) {}
  }
  return null;
}
