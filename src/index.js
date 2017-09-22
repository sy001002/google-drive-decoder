const https = require('https');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const getId = require('./util/get-id');
const urlMaker = require('./util/url-maker');

function getFilename(body) {
   const $ = cheerio.load(body);
   const target = $('meta[itemprop=name]');

   if( target.length > 0 )
      return target.attr('content');
}

function getHeaders(url, timeout) {
   return new Promise((resolve, reject) => {
      https.get(url, res => {
         const headers = {...res.headers};
         res.destroy();
         resolve(headers);
      }).on('error', err => reject(err));
   });
}

function getCookie(headers) {
   const setCookieList = headers['set-cookie'];
   if( !Array.isArray(setCookieList) )
      return;

   for(const setCookie of setCookieList) {
      const result = (/^download_warning[^=]+=\s*([^;]+)/).exec(setCookie);

      if( result ) {
         return {
            cookie: result[0],
            confirm: result[1]
         };
      }
   }
}

async function main(url, timeout = 30000) {
   const id = getId(url);
   if( !id )
      throw new Error('invalid url');

   const resView = await fetch(urlMaker.getView(id), {
      timeout
   });

   if( !resView.ok )
      throw new Error(`status code: ${resView.status}`);

   const filename = getFilename(await resView.text());
   if( !filename )
      throw new Error('can not get filename');

   const headers = await getHeaders(urlMaker.getDownload(id));

   if( headers.location ) {
      return {
         url: headers.location,
         filename
      };
   }

   const cookie = getCookie(headers);
   if( !cookie )
      throw new Error('cookie download_warning* not found');

   return {
      url: urlMaker.getConfirm(id, cookie.confirm),
      filename,
      cookie: cookie.cookie
   };
}

module.exports = main;