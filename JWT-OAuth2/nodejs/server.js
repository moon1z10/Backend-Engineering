const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;
const tokensFilePath = './tokens.json';

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

let tokens = {};

// Load tokens from file when server starts
function loadTokens() {
    if (fs.existsSync(tokensFilePath)) {
        const data = fs.readFileSync(tokensFilePath, 'utf8');
        tokens = JSON.parse(data);
    }
}

// Save tokens to file
function saveTokens() {
    fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));
}

// Middleware to check access token
app.use((req, res, next) => {
    if (req.url === '/' || req.url.startsWith('/auth')) {
        return next();
    }

    const accessToken = req.cookies['access_token'];  // 쿠키에서 액세스 토큰을 가져옵니다.
    if (!accessToken) {  // 액세스 토큰이 없는 경우
        return res.redirect('/');  // 로그인 페이지로 리다이렉트합니다.
    }

    try {
        const userInfoResponse = axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: {
                Authorization: `Bearer ${accessToken}`  // 액세스 토큰을 사용해 사용자 정보를 요청합니다.
            }
        });
        req.user = userInfoResponse.data;  // 사용자 정보를 요청 객체에 추가합니다.
        return next();  // 다음 미들웨어로 넘어갑니다.
    } catch (error) {
        if (error.response && error.response.status === 401) {  // 액세스 토큰이 유효하지 않은 경우
            const email = error.response.data.error_description.split(':')[1].trim();  // 이메일 주소를 추출합니다.
            const refreshToken = tokens[email]?.refresh_token;  // DB(JSON파일)에 저장된 리프레시 토큰을 가져옵니다.
            if (refreshToken) {  // 리프레시 토큰이 있는 경우
                try {
                    const tokenResponse = axios.post(process.env.GOOGLE_TOKEN_URL, querystring.stringify({
                        client_id: process.env.CLIENT_ID,
                        client_secret: process.env.CLIENT_SECRET,
                        refresh_token: refreshToken,
                        grant_type: 'refresh_token'
                    }), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    res.cookie('access_token', tokenResponse.data.access_token, { httpOnly: true });  // 새 액세스 토큰을 쿠키에 저장합니다.
                    req.user = { email: email };  // 최소한의 사용자 정보를 요청 객체에 추가합니다.
                    tokens[email] = {
                        ...tokens[email],
                        access_token: tokenResponse.data.access_token  // 새로운 액세스 토큰을 저장합니다.
                    };
                    saveTokens();  // 토큰 정보를 파일에 저장합니다.
                    return next();  // 다음 미들웨어로 넘어갑니다.
                } catch (tokenError) {
                    console.error('Error refreshing access token:', tokenError.response.data);
                    return res.status(401).send('Authentication required');  // 토큰 갱신 실패 시 인증 필요 상태를 반환합니다.
                }
            }
        }
        return res.status(401).send('Authentication required');  // 다른 경우에도 인증 필요 상태를 반환합니다.
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/auth/logout', (req, res) => {
    res.clearCookie('access_token');  // 액세스 토큰 쿠키 삭제
    res.redirect('/');  // 로그인 페이지로 리디렉션
});

app.get('/auth/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify({
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        access_type: 'offline',
        prompt: 'consent',  // 사용자에게 매번 동의를 구할 수 있어, 확실히 refresh_token을 받을 수 있음
    })}`;
    res.redirect(googleAuthUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    console.log('Authorization code:', code);
    console.log('Request headers:', req.headers);

    try {
        const tokenResponse = await axios.post(process.env.GOOGLE_TOKEN_URL, querystring.stringify({
            code: code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            grant_type: 'authorization_code'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Token response headers:', tokenResponse.headers);
        console.log('Token response data:', tokenResponse.data);

        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: {
                Authorization: `Bearer ${tokenResponse.data.access_token}`
            }
        });

        console.log('User info response headers:', userInfoResponse.headers);
        console.log('User info response data:', userInfoResponse.data);

        const user = userInfoResponse.data;
        tokens[user.email] = {
            ...user,
            refresh_token: tokenResponse.data.refresh_token
        };
        saveTokens();

        res.cookie('access_token', tokenResponse.data.access_token, { httpOnly: true });
        res.send(`Hello ${user.name}`);
    } catch (error) {
        console.error('Error during OAuth callback:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Error response headers:', error.response.headers);
            console.error('Error response data:', error.response.data);
        }
        res.status(500).send('Authentication failed');
    }
});

app.get('/api/hello-world', (req, res) => {
    res.status(200).send('Hello World');
});

app.listen(PORT, () => {
    loadTokens();
    console.log(`Server running on http://localhost:${PORT}`);
});
