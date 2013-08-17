// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var common = require('../common');
var assert = require('assert');

var vm = require('vm');
var script = vm.createScript('"passed";');

common.debug('run in a new empty context');
var context = vm.createContext();
var result = script.runInContext(context);
assert.equal('passed', result);

common.debug('create a new pre-populated context');
context = vm.createContext({'foo': 'bar', 'thing': 'lala'});
assert.equal('bar', context.foo);
assert.equal('lala', context.thing);

common.debug('test updating context');
script = vm.createScript('foo = 3;');
result = script.runInContext(context);
assert.equal(3, context.foo);
assert.equal('lala', context.thing);

// Issue GH-227:
vm.runInNewContext('', null, 'some.js');

// Issue GH-1140:
common.debug('test runInContext signature');
var gh1140Exception;
try {
  vm.runInContext('throw new Error()', context, 'expected-filename.js');
}
catch (e) {
  gh1140Exception = e;
  assert.ok(/expected-filename/.test(e.stack),
            'expected appearance of filename in Error stack');
}
assert.ok(gh1140Exception,
          'expected exception from runInContext signature test');

// GH-558, non-context argument segfaults / raises assertion
function isTypeError(o) {
  return o instanceof TypeError;
}

([undefined, null, 0, 0.0, '', {}, []].forEach(function(e) {
  assert.throws(function() { script.runInContext(e); }, isTypeError);
  assert.throws(function() { vm.runInContext('', e); }, isTypeError);
}));

// Issue GH-693:
common.debug('test RegExp as argument to assert.throws');
script = vm.createScript('var assert = require(\'assert\'); assert.throws(' +
                         'function() { throw "hello world"; }, /hello/);',
                         'some.js');
script.runInContext(vm.createContext({ require : require }));
