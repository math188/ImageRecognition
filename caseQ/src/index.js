const express = require('express');
const app = express();
const session = require('express-session');
const multer = require('multer');
const upload = multer({ dest: 'tmp_loads/'});
const fs = require('fs');


// 連到 sql
app.use(express.static(__dirname + '/../public'));

// 註冊樣板引擎、設定views的路徑
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views');  // 不一定要打這列(不影響)

// 頂層 middleware
// 解析 post urlencoded 的 middleware
app.use(express.urlencoded({ extended: false }));
// 解析 json 的 middleware
app.use(express.json());

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: '加密用的字串',
    cookie: { maxAge: 1200000 }   // 單位是毫秒
}));

// 自訂一個 middleware
app.use((req, res, next) => {
    res.locals.pageName = '';
    req.query.address = 'Taiwan';
    res.locals.isAdmin = false;
    if (req.session.member && req.session.member.email) {
        res.locals.member = req.session.member;
    res.locals.isAdmin = true;
    };
    next();
});

// add 圖片
app.post('/try-upload', upload.single('image'), (req, res) => {
    // console.log(req.file);
    let ext = '';
    switch (req.file.mimetype) {
        case 'image/png':
            ext = '.png';
            break;
        case 'image/jpeg':
            ext = '.jpg';
            break;
    };
    if (ext) {
        let filename = (new Date().getTime()) + ext;
        fs.rename(
            req.file.path,
            './public/img/' + filename,
            error => {
                res.json({
                    success: true,
                    img: '/img/' + filename
                });
            }
        )
    } else {
        fs.unlink(req.file.path, error => {
            res.json({
                success: false,
                info: '請上傳 jpg 或 png 格式檔案'
            })
        })
    }
});


// app.use('/question', require(__dirname + '/question'));
app.use('/question', require(__dirname + '/question'));

// 錯誤網址的畫面
app.use((req, res) => {
    res.type('text/html');
    res.status(404);
    res.send('<h2>404 - Page is Not Found !</h2>');
});

app.listen(4000, () => {
    console.log('啟動 server 偵聽埠號 4000');
})