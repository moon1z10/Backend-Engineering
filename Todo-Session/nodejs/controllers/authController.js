const users = [{ id: 'user', password: 'pass' }]; // 임시 사용자 데이터

exports.getLoginPage = (req, res) => {
    if (req.session.user) {
        res.redirect('/todo');
    } else {
        res.render('index', { loginFailed: false });
    }
};

exports.getRegisterPage = (req, res) => {
    res.render('register');
};

exports.registerUser = (req, res) => {
    const { id, password } = req.body;
    users.push({ id, password });
    res.redirect('/');
};

exports.loginUser = (req, res) => {
    const { id, password } = req.body;
    const user = users.find(u => u.id === id && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect('/todo');
    } else {
        res.render('index', { loginFailed: true });
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};
