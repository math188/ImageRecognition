from selenium import webdriver
from time import sleep
from bs4 import BeautifulSoup as bs
import pandas as pd
import os

current_dir = os.getcwd()
url = 'https://www.facebook.com/W213DORA/'
browser = webdriver.Chrome(executable_path = current_dir + '\..\chromedriver.exe')
browser.get(url)
browser.find_element_by_id('email').send_keys('0912079036')
browser.find_element_by_id('pass').send_keys('p0e2t2e0r')
browser.find_element_by_css_selector('[type="submit"]').click()
sleep(5)
# # for i in range(3):
# #     scheight = .1
# #     while scheight < 9.9:
# #         browser.execute_script("window.scrollTo(0, document.body.scrollHeight/%s);" % scheight)
# #         scheight += .01
res_text = browser.page_source
soup = bs(res_text, 'lxml')
# 發文名
ll = soup.select('div.nc684nl6 a[class="oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl oo9gr5id gpro0wi8 lrazzd5p"]')
n_list = [item.span.text for item in ll]
# 發文時間
tt = soup.select('[class="oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gmql0nx0 gpro0wi8 b1v8xokw"]')
t_list = [item.text for item in tt]
# 發文內容
pp = soup.select('[style="text-align: start;"]')
p_list = [item.text for item in pp]

# # index 數量
# dex = [i+1 for i in range(len(t_list))]
# # 印出 df
# df = pd.DataFrame({'name': n_list, 'time': t_list, 'content': p_list}, index=dex, columns=['name', 'time', 'content'])
# print(df.drop_duplicates())

browser.quit()


import mysql.connector
db = mysql.connector.connect(
    host='localhost',          # 主機名稱
    database='scrapybug', # 資料庫名稱
    user='root',        # 帳號
    password='p0e2t2e0r')  # 密碼
#定義資料庫位置
cur = db.cursor()
for i in range(len(n_list)):
    sql = "INSERT INTO `test01` (`name`, `time`, `innertext`) VALUES (%s, %s, %s);"
    values = (n_list[i], t_list[i], p_list[i])
    cur.execute(sql, values)
db.commit()
db.close()