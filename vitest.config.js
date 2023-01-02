export default {
  test: {
    globals: true,

    // Don't use threads so that tests which
    // modify the file system with test fixtures
    // don't conflict.
    threads: false
  }
}
