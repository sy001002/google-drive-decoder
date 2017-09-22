const { URL } = require('url');

function getFromQuery(url) {
   const Url = new URL(url);
   return Url.searchParams.get('id');
}

function getFromView(url) {
   const result = (/\/file\/d\/([^\/]+)\/view/).exec(url);
   if( result )
      return result[1];
}

function getId(url) {
   if( !(/^https:\/\/drive\.google\.com/).test(url) )
      return;

   const id = getFromQuery(url);
   if( id )
      return id;

   return getFromView(url);
}

module.exports = getId;
