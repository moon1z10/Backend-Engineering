const todos = []; // 임시 Todo 데이터

exports.getTodoPage = (req, res) => {
    res.render('todo', { todos, hideUrl: true });
};

exports.addTodo = (req, res) => {
    const { item } = req.body;
    todos.push({ item, completed: false });
    res.redirect('/todo');
};

exports.completeTodo = (req, res) => {
    const { index } = req.body;
    todos[index].completed = true;
    res.redirect('/todo');
};

exports.deleteTodo = (req, res) => {
    const { index } = req.body;
    todos.splice(index, 1);
    res.redirect('/todo');
};
