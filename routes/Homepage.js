const express = require('express');
const router = express.Router();


// Welcome the user the user to the api homepage
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Welcome to blogapp API! Here are the available routes:',
    routes: {
      homepage: '/',
      authentication: '/auth',
      members: '/member',
      posts: '/posts',
    },
  });
});

module.exports = router;
