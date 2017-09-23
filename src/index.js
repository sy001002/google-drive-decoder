const { URL } = require('url');
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

function getHeaders(url, timeout, cookie) {
   return new Promise((resolve, reject) => {
      const Url = new URL(url);
      const headers = {};
      if( cookie )
         headers.cookie = cookie;

      https.get({
         hostname: Url.hostname,
         path: Url.pathname + Url.search,
         timeout,
         headers
      }, res => {
         const headers = {...res.headers};
         res.destroy();
         resolve(headers);
      }).on('error', err => reject(err));
   });
}

async function followLocation(url, timeout, cookie) {
   let result = url;

   while(1) {
      const headers = await getHeaders(result, timeout, cookie);
      if( headers.location )
         result = headers.location;
      else
         return result;
   }
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

   const headers = await getHeaders(urlMaker.getDownload(id), timeout);
   if( headers.location ) {
      return {
         url: await followLocation(headers.location, timeout),
         filename,
         range: 'bytes'
      };
   }

   const cookie = getCookie(headers);
   if( !cookie )
      throw new Error('cookie download_warning* not found');

   return {
      url: await followLocation(urlMaker.getConfirm(id, cookie.confirm), timeout, cookie.cookie),
      filename,
      cookie: cookie.cookie,
      range: 'bytes'
   };
}

module.exports = main;
