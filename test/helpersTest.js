const chai = require('chai');
const assert = chai.assert;
const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined if email is not in database', function() {
    const user = findUserByEmail("user123@example.com", testUsers);
    // Write your assert statement here
    assert.isUndefined(user);
  });
});