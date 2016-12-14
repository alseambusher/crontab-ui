/*jshint esversion: 6*/
// refer nodemailer for more info

var transporterStr = 'smtps://user%40gmail.com:password@smtp.gmail.com';

var mailOptions = {
    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
    subject: 'Job Test#21 Executed ✔', // Subject line
    text: 'Test#21 results attached 🐴', // plaintext body
    html: '<b>Test#21 🐴</b> results attached' // html body
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
