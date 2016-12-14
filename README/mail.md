Mailing
=======

Now we have an option to send mails after execution of jobs along with __output and errors attached as text files__. This internally uses [nodemailer](nodemailer.com) and all the options available through nodemailer are available here.

<img src="http://i.imgur.com/BMtWcIX.png" width="400"/>

Defaults
========
To change the default transporter and mail config you can modify `config/mailconfig.js`.

```js
var transporterStr = 'smtps://user%40gmail.com:password@smtp.gmail.com';

var mailOptions = {
    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
    subject: 'Job Test#21 Executed ✔', // Subject line
    text: 'Test#21 results attached 🐴', // plaintext body
    html: '<b>Test#21 🐴</b> results attached' // html body
};
```

Troubleshooting
===============

Make sure that you have `node` at `/usr/local/bin/node` else you need to create a softlink like this
```bash
ln -s [location of node] /usr/local/bin/node
```

