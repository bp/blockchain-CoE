const IORedis = jest.genMockFromModule('ioredis');
IORedis.prototype.get.mockImplementation((key, callback) => {
  return null;
});
IORedis.prototype.set.mockImplementation((key, callback) => {
  return null;
});
IORedis.prototype.del.mockImplementation((key, callback) => {
  return null;
});
module.exports = IORedis;
