const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const db = require(__dirname + '/db_sql');
const multer = require('multer');
const upload = multer({ dest: 'tmp_loads/' });
const fs = require('fs');


// middleware
router.use((req, res, next) => {
    res.locals.title = '阿坤解題';
    res.locals.pageName = 'question';
    next();
})

// // 圖片新增測試
// router.get('/add2', (req, res) => {
//     res.render('question/add2');
// })

// add 題目
router.get('/add', (req, res) => {
    res.locals.title = '阿坤解題 - 發問處';
    res.locals.pageName = 'ques-add';
    res.render('question/add');
});
router.post('/add', (req, res) => {
    const output = {
        success: false,
        postData: req.body
    };
    if (req.body.email) {
        const sqltxt = "INSERT INTO queslist (`name`, `email`, `mobile`, `img_src`, `remark`, `conclution`,`create_at`) VALUES" +
            "(?, ?, ?, ?, ?, ?,NOW())";
        db.query(sqltxt, [
            req.body.name,
            req.body.email,
            req.body.mobile,
            req.body.img_src,
            req.body.remark,
            req.body.conclution,
            req.body.create_at
        ], (error, results) => {
            if (error) {
                // console.log(error);
                output.error = error;
                output.info = '資料上傳失敗';
            } else {
                // console.log(req.body.conclution.length);
                output.success = true;
                output.info = '問題已上傳';
                output.results = results;
            };
            res.json(output);
        });
    } else {
        output.info = '請記得填寫email及上傳問題圖檔';
        res.json(output);
    };
});

// 題目表單
router.get('/list/:page?', (req, res) => {
    res.locals.title = '阿坤解題 - 列表';
    res.locals.pageName = 'ques-list';
    const perPage = 5;
    let tolRows = 0;
    let tolPages = 0;
    let page = req.params.page ? parseInt(req.params.page) : 1;

    const tol_sql = "SELECT COUNT(1) num FROM queslist";
    db.query(tol_sql, (error, results) => {
        // console.log(results);    // results = [{num: 20}] 的形式
        tolRows = results[0].num;
        tolPages = Math.ceil(tolRows / perPage);

        // TODO: 要排除沒資料的狀況
        if (page < 1) {
            res.redirect('/question/list/1');
            return;
        } else if (page > tolPages) {
            res.redirect('/question/list/' + tolPages);
            return;
        }

        const sql = `SELECT * FROM queslist LIMIT ${(page - 1) * 5}, ${perPage}`;
        db.query(sql, (error, results, fields) => {
            const output = {
                perPage: perPage,
                page: page,
                tolRows: tolRows,
                tolPages: tolPages,
                rows: results
            };
            if (res.locals.isAdmin) {
                res.render('question/list_member', output);
            } else {
                res.render('question/list', output);
            }
        });
    });
})

// 編輯資料
router.get('/edit/:sid', (req, res) => {
    res.locals.title = '阿坤解題 - 聯絡資料編輯';
    res.locals.pageName = 'ques-edit';
    let sid = req.params.sid;
    const sql = "SELECT * FROM queslist WHERE `sid` = ?";
    db.query(sql, sid, (error, results) => {
        if (results && results.length == 1) {
            // console.log(results[0]);
            res.render('question/edit', {
                row: results[0]
            });
        } else {
            return res.redirect('/question/list');
        };
    });
})
// 編輯資料回傳
router.post('/edit/:sid', (req, res) => {
    const output = {
        success: false,
        postData: req.body
    };
    return db.queryAsync("UPDATE queslist SET ? WHERE `sid` = ?", [req.body, req.params.sid])
        .then(results => {
            if (!results) return;
            if (results.changedRows == 1) {
                output.success = true;
                output.info = '編輯成功，頁面跳轉後請重新整理';
            } else {
                output.info = '資料沒有變更';
            }
            res.json(output);
        })
        .catch(error => {
            output.info = '資料更新錯誤';
            output.error = error;
            res.json(output);
        })
});

// 刪除資料
router.get('/del/:sid', (req, res) => {
    const sql = "DELETE FROM `queslist` WHERE `sid` = ?"
    db.query(sql, req.params.sid, (error, results) => {
        // console.log('del:', results);
        //res.json(results);
        // res.send(req.header('Referer'));
        res.redirect(req.header('Referer')); // 回到原來的頁面
    });
})

// 分析圖片資料
router.get('/analysis/:sid', (req, res) => {
    res.locals.title = '阿坤解題 - 圖片分析';
    res.locals.pageName = 'ques-analysis';
    let sid = req.params.sid;
    const sql = "SELECT * FROM queslist WHERE `sid` = ?";
    db.query(sql, sid, (error, results) => {
        if (results && results.length == 1) {
            // console.log(results[0]);
            res.render('question/analysis', {
                row: results[0]
            });
        } else {
            return res.redirect('/question/list');
        };
    });
})

// add 會員資料
router.get('/add_member', (req, res) => {
    res.locals.title = '阿坤解題 - 會員註冊';
    res.locals.pageName = 'ques-addmember';
    res.render('question/add_member');
});
router.post('/add_member', (req, res) => {
    const output = {
        success: false,
        postData: req.body
    };
    const sql_e = "SELECT * FROM `member` WHERE `email` = ? AND `sid` <> ?";
    db.query(sql_e, [req.body.email, req.params.sid], (error, results) => {
        if (results.length) {
            output.info = 'e-mail資料重複使用';
        } else {
            if (req.body.email) {
                const sqltxt = "INSERT INTO `member` (`name`, `email`, `password`, `mobile`,`create_at`) VALUES" +
                    "(?, ?, ?, ?,NOW())";
                const fm = 'YYYY-MM-DD HH:mm:ss';
                req.body.create_at = moment(req.body.create_at).format(fm);
                db.query(sqltxt, [
                    req.body.name,
                    req.body.email,
                    req.body.password,
                    req.body.mobile,
                    req.body.create_at
                ], (error, results) => {
                    if (error) {
                        // console.log(error);
                        output.error = error;
                        output.info = '註冊失敗！';
                    } else {
                        output.success = true;
                        output.info = '註冊成功～';
                        output.results = results;
                    };
                    res.json(output);
                });
            } else {
                output.info = '請記得填寫email（帳號）';
                res.json(output);
            };
        }
    });
});

// 登入畫面
router.get('/login', (req, res) => {
    res.locals.title = '阿坤解題 - 會員登入';
    res.locals.pageName = 'ques-login';
    res.render('question/login');
});
router.post('/login', (req, res) => {
    const sql = "SELECT `sid`, `name`, `email` FROM `member` WHERE `email` = ? AND `password` = ?";
    db.queryAsync(sql, [req.body.email, req.body.password])
        .then(results => {
            if (results && results.length == 1) {
                req.session.member = results[0];
                res.json({
                    success: true,
                    member: results[0]
                })
            } else {
                res.json({
                    success: false
                })
            }
        })
        .catch(error => {
            res.json({
                success: false,
                error: error
            })
        });
});
router.get('/logout', (req, res) => {
    delete req.session.member;
    res.redirect('/question/login');
});


module.exports = router;