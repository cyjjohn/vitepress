## 什么是分组

通俗来说，我理解的分组就是在正则表达式中用（）包起来的内容代表了一个分组，像这样的：
```javascript
var reg = /(\d{2})/
reg.test('12');  //true
```
这里reg中的(/d{2})就表示一个分组，匹配两位数字
## 分组内容的的形式
一个分组中可以像上面这样有一个具体的表达式，这样可以优雅地表达一个重复的字符串
```javascript
/hahaha/
/(ha){3}/
```
这两个表达式是等效的，但有了分组之后可以更急简洁。

体格分组中还可以有多个候选表达式，例如
```javascript
var reg = /I come from (hunan|hubei|zhejiang)/;
reg.test('I come from hunan');   //true
reg.test('I come from hubei');   //true
```
也就是说在这个分组中，通过|隔开的几个候选表达式是并列的关系，所以可以把这个|理解为或的意思

### 分组的分类
分组有四种类型

- 捕获型 ()
- 非捕获型 (?😃
- 正向前瞻型 (?=)
- 反向前瞻型 (?!)

我们使用的比较多的都是捕获型分组，只有这种分组才会暂存匹配到的串

## 分组的应用
分组在正则中还算使用的比较广泛的，我们常用的是捕获型分组

- 捕获与引用
被正则表达式捕获(匹配)到的字符串会被暂存起来，其中，由分组捕获到的字符串会从1开始编号，于是我们可以引用这些字符串：
  ```javascript
  var reg = /(\d{4})-(\d{2})-(\d{2})/;
  var dateStr = '2018-04-18';
  reg.test(dateStr);  //true
  RegExp.$1   //2018
  RegExp.$2   //04
  RegExp.$3   //18
  ```
- 结合replace方法做字符串自定义替换
  String.prototype.replace方法的传参中可以直接引用被捕获的串，比如我们想开发中常见的日期格式替换,例如后台给你返回了一个2018/04/18,让你用正则替换为2018-04-18，就可以利用分组
  ```javascript
  var dateStr = '2018/04/18';
  var reg = /(\d{4})\/(\d{2})\/(\d{2})/;
  dateStr = dateStr.replace(reg, '$1-$2-$3') //"2018-04-18"
  ```
  不过这里需要注意的是/是需要用\转义的
- 反向引用
  正则表达式里也能进行引用，这称为反向引用：
  ```javascript
  var reg = /(\w{3}) is \1/
  reg.test('kid is kid') // true
  reg.test('dik is dik') // true
  reg.test('kid is dik') // false
  reg.test('dik is kid') // false
  ```
- 需要注意的是，如果引用了越界或者不存在的编号的话，就被被解析为普通的表达式
  ```javascript
  var reg = /(\w{3}) is \6/;
  reg.test( 'kid is kid' ); // false
  reg.test( 'kid is \6' );  // true
  ```
- 非捕获型分组
  有的时候只是为了分组并不需要捕获的情况下就可以使用非捕获型分组，例如
  ```javascript
  var reg = /(?:\d{4})-(\d{2})-(\d{2})/
  var date = '2012-12-21'
  reg.test(date)
  RegExp.$1 // 12
  RegExp.$2 // 21
  ```
- 正向与反向前瞻型分组
  - 正向前瞻型分组：你站在原地往前看，如果前方是指定的东西就返回true，否则为false
    ```javascript
    var reg = /kid is a (?=doubi)/
    reg.test('kid is a doubi') // true
    reg.test('kid is a shabi') // false
    ```
  - 反向前瞻型分组：你站在原地往前看，如果前方不是指定的东西则返回true，如果是则返回false
    ```javascript
    var reg = /kid is a (?!doubi)/
    reg.test('kid is a doubi') // false
    reg.test('kid is a shabi') // true
    ```
- 既然前瞻型分组和非捕获型分组都不会捕获，那他们有什么区别呢？先看例子：
  ```javascript
  var reg, str = "kid is a doubi";
  reg = /(kid is a (?:doubi))/
  reg.test(str)
  RegExp.$1 // kid is a doubi

  reg = /(kid is a (?=doubi))/
  reg.test(str)
  RegExp.$1 // kis is a
  ```
也就是说非捕获型分组匹配到的字符串任然会被外层分组匹配到，而前瞻型不会，所以如果你希望在外层分组中不匹配里面分组的值的话就可以使用前瞻型分组了。