const admin = require("firebase-admin");
// require("dotenv/config");
// const { adminConfig } = require(process.env.SERVICE_PATH);
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "gobble-b3dfa",
    "private_key_id": "c455d5ff019a560e7bfd26d8bf3093a4871749ea",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDOC2QuVD+T2zUA\nidyq0kbpanAug5sQiXMCnTerZTU0v2lCdJlC2539W1SpFhiesMbt90rJ5AXPDAzE\nocdfutvA1gghvYHhwpK9tY9pqOTLEfVZQUWDBJYi6+24yFkIYMEh5sHSSTuKuQIz\nwrN9A1B/QPN3EgyVsVEXgbtsewnihJCFnIkkD4hfosC41C57Pz4Mz7W17My1mfsf\nLG7JCCwzblrtz2Esx5W90IlMDRzYr9WPaFUc3NJ8XaVTcFCIJY7lcNTg6APmdJzr\n1XoLAg5nxQp+sDSBfa+4p3jskMYWUV1QnYGe70p/EiqeUW/qxPGkSTDSanzKdDP/\nRW8e0GgHAgMBAAECggEASQiko/9c4c3rhZtYSnxqgkYmKXagukXeLGkJ2IjxSRcn\n+lRWFuq9n5aF9cFNTMKgYK0tJ07Z+D/vLquhff8/8aRsEXmY1isf1HrMsMkbABgH\nfXGzb/NqPEqgYsUxOdUB4EBpJ16p6kwVyb8T3BYWrGSbZ/NP3qeRdOGZS6R5Jn7v\nnu2JtIdXnbfGNQgFpI1UEOTjIZHJd9rvK4wiebfqmZxjTNN1kvR5tLIuJV9uHAUN\nkIcbK5zl33SbIs0F/Q+B9+CzjRHSOthd1n70S4zcmcYKRi+cFrW5DKa9m79MlMEM\n1aMD5Xpx/Ft6fl+8DwQ5naqqmjymzQ171c00Gusb0QKBgQDzFj83lVWUyN5thRfA\nnklXkOQng8huurNXeStYTzDVqGKg00Lg2T9PXfspMfk8xUq3q0BSMuKR2peMLTFu\nM+9g1KyH/HwdFtqiX9p0gGXg/F3iRfscOeXhn5r77twKxDanKnwtSiI0xW+10Bd/\nGSLgN0X1Mm1W+2O7TTXBc82oIwKBgQDY/WcNsbcQCA/FNWL1oEW/AdPW8kfc5J0U\nNCxDyvIdHGRMLK4FOcncK6SXL5gDepNcu7Rj80F+L+KtntlsUsjZD+wAZHB+Zd3m\nXsnzayro6SimW0pIogbvjRgZyBJP2c/BpYDyM6Be5ACU649Gz/+7quYuPIdJL+KN\nKC/K2SZszQKBgACnHqRXklND9tT0dovd4PSLPxGcGP2zIqgpeyRRkiAAw8MKzjMs\nYi8kYXhK2hB/tyOnIhUWbeVWYPHPbUKOgSYRbCUxWGP7m7qz5zJI5f0ksFvbNEFv\nJl7kvtXOXmjo/fyU8KBugokBvrsORAHjX2SawWVXLVP+eNYX7v0GApdhAoGAOEa4\nRHfz12eP14C6EqQnkptBuryJYMO17Xh+hnKLCnvDk3H/DAHp1X1IKaHBVh2jPGi+\nJzH+qWB39Ll/ADYUOx+DALML7ewzebzZuZTwwwk9bq+8e0vyaox4VK9r+GOwGzP2\nVlqHXDTb5cOWHDJzy9NN8W3nVFbj9eIXSw+4hH0CgYBdQt3mcfXZ8YtukicIPcRG\nUhouu4zGqPzjU5fc9dfi5gFjgSnvp5mhUhgWEFRMNWTS8Ve0/V1eJFlwq2WMkv0H\nwy+TsxvM2J9gsT8UsF+inDWSUvYCQpaLNUXnDxOT/Xqwz1ExVVZgIb5kvrVgIqAz\nA2uP1lgbsnfGv+aWIpNgag==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-ix5ai@gobble-b3dfa.iam.gserviceaccount.com",
    "client_id": "111164196882187660831",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ix5ai%40gobble-b3dfa.iam.gserviceaccount.com"
  }),
  databaseURL: "https://gobble-b3dfa-default-rtdb.asia-southeast1.firebasedatabase.app"
});

module.exports = { admin };