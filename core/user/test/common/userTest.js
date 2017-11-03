const Chai = require('chai');
const expect = Chai.expect;

module.exports = {
    userTestSuite: {
        options: {
            description: 'Test suite to run all user related userTestSuite',
            timeout: 100,
            params: {
                ui: 'tdd',
                reporter: 'list'
            },
            beforeAll: function() {
                console.log('This is Base beforeAll');
            },
            afterAll: function() {
                console.log('This is Base afterAll');
            }
        },
        data: {
            value: 2
        },
        insertUser: {
            options: {
                description: 'Test suite to run all user related insertUser',
                beforeEach: function() {
                    console.log('   This is insertUser beforeEach');
                },
                beforeAll: function() {
                    console.log('   This is insertUser beforeAll');
                },
                afterEach: function() {
                    console.log('   This is insertUser afterEach');
                },
                afterAll: function() {
                    console.log('   This is insertUser afterAll');
                }
            },
            testIfEqual: {
                description: 'Testing equality...',
                test: function(done) {
                    //console.log(TEST.data.value);
                    expect(TEST.data.value).to.equal(TEST.data.value);
                    done();
                }
            }
        }
    }
};