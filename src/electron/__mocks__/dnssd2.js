class MockBrowser {
    on() {
        return this;
    }
    start() {
        return this;
    }
}

module.exports = {
    Browser: MockBrowser
};
