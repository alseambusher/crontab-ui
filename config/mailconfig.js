/*jshint esversion: 6*/
// refer nodemailer for more info

var transporterStr = 'smtps://user%40gmail.com:pass@smtp.gmail.com';

var mailOptions = {
    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

if (typeof window === 'undefined') {
  exports.transporterStr = transporterStr;
  exports.mailOptions = mailOptions;
} else {
  if (!window.config)
    window.config = {};
  window.config.transporterStr = transporterStr;
  window.config.mailOptions = mailOptions;
}
