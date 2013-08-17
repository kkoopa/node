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

common.globalCheck = false;

common.debug('run a string');
common.debug('script created');
var script = vm.createScript('\'passed\';');
var result1 = script.runInContext(vm.createContext());
var result2 = script.runInContext(vm.createContext());
assert.equal('passed', result1);
assert.equal('passed', result2);

common.debug('thrown error');
assert.throws(function() {
  vm.runInNewContext('throw new Error(\'test\');');
});



common.debug('undefined reference');
var error;
try {
  vm.runInNewContext('foo.bar = 5;');
} catch (e) {
  error = e;
}
assert.ok(error);
assert.ok(error.message.indexOf('not defined') >= 0);

common.debug('error.message: ' + error.message);


hello = 5;
vm.runInNewContext('hello = 2');
assert.equal(5, hello);


common.debug('pass values in and out');
code = 'foo = 1;' +
       'bar = 2;' +
       'if (baz !== 3) throw new Error(\'test fail\');';
foo = 2;
obj = { foo: 0, baz: 3 };
script = vm.createScript(code);
var baz = script.runInContext(vm.createContext(obj));
assert.equal(1, obj.foo);
assert.equal(2, obj.bar);
assert.equal(2, foo);

common.debug('call a function by reference');
script = vm.createScript('f()');
function changeFoo() { foo = 100 }
script.runInContext(vm.createContext({ f: changeFoo }));
assert.equal(foo, 100);

common.debug('modify an object by reference');
script = vm.createScript('f.a = 2');
var f = { a: 1 };
script.runInContext(vm.createContext({ f: f }));
assert.equal(f.a, 2);

common.debug('invalid this');
assert.throws(function() {
  script.runInContext.call(vm.createContect('\'hello\';'));
});


