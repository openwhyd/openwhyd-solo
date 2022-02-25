require('approvals').mocha();

describe('When running some tests', function () {
  it('should be able to use Approvals', function () {
    var data = 'Hello World!';
    this.verify(data); // or this.verifyAsJSON(data)
  });
});
