'use strict';

var transporterStr = 'smtps://user%40gmail.com:password@smtp.gmail.com';

var mailOptions = {
  from: '"Fred Foo" <foo@blurdybloop.com>',
  to: 'bar@blurdybloop.com, baz@blurdybloop.com',
  subject: 'Job Test#21 Executed',
  text: 'Test#21 results attached',
  html: '<b>Test#21</b> results attached'
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
