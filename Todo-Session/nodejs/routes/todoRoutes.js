const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

router.get('/', todoController.getTodoPage);
router.post('/add', todoController.addTodo);
router.post('/complete', todoController.completeTodo);
router.post('/delete', todoController.deleteTodo);

module.exports = router;
