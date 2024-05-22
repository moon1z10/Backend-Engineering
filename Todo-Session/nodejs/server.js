const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const authMiddleware = require('./middlewares/authMiddleware');


const app = express();
const port = 3000;

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 300000 } // 5분 (300,000 밀리초)
}));

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 라우트 설정
app.use('/', authRoutes);
app.use('/todo', authMiddleware, todoRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
