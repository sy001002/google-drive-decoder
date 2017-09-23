```js
const gdDecoder = require('google-drive-decoder');

// gdDecoder(<url>, <timeout Default to 30000>)
gdDecoder('<url>', 30000)
   .then(data => console.log(data))
   /*{
      url: '<real url>',
      range: 'bytes',
      finename: '<filename>',
      cookie: `<cookie>`         // optional
   }*/
   .catch(err => console.error(err));
```
