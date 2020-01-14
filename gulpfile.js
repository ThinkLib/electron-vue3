const fs = require('fs');
const join = require('path').join;
const execSync = require('child_process').execSync;
const gulp = require("gulp");
const minifyCss = require('gulp-minify-css');//压缩CSS为一行；
const htmlmin = require('gulp-htmlmin');//html压缩组件
const gulpRemoveHtml = require('gulp-remove-html');//标签清除
const removeEmptyLines = require('gulp-remove-empty-lines');//清除空白行
const buildBasePath = 'dist/';//构建输出的目录

function findSync(startPath) {
    let result = [];

    function finder(path) {
        let files = fs.readdirSync(path);
        files.forEach((val, index) => {
            let fPath = join(path, val);
            let stats = fs.statSync(fPath);
            if (stats.isDirectory()) finder(fPath);
            if (stats.isFile()) result.push(fPath);
        });
    }

    finder(startPath);
    return result;
}

const checkDirExist = (folderpath) => {
    const pathArr = folderpath.split('\\');
    let _path = '';
    for (let i = 0; i < pathArr.length; i++) {
        if (pathArr[i]) {
            _path += `${i === 0 ? '' : '/'}${pathArr[i]}`;
            if (!fs.existsSync(_path)) {
                fs.mkdirSync(_path);
            }
        }
    }
};

//读取文件，并且替换文件中指定的字符串
const replaceFile = (filePath, sourceRegx, targetStr) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return err;
        }
        let str = data.toString();
        str = str.replace(sourceRegx, targetStr);
        fs.writeFile(filePath, str, (err) => {
            if (err) return err;
        });
    });
};

gulp.task('compress', async () => {
    //cfg
    gulp.src('src/main/**/*.json')
        .pipe(gulp.dest(buildBasePath));
    //css
    gulp.src('src/main/**/*.css')
        .pipe(minifyCss())//压缩css到一样
        .pipe(gulp.dest(buildBasePath));//输出到css目录
    //js
    gulp.src('src/main/**/*.min.js')
        .pipe(gulp.dest(buildBasePath));

    // Closure Compiler
    for (let i of findSync(__dirname + '/src/main')) {
        i = i.replace(__dirname + '\\src\\main', '');
        if (i.indexOf('config.json') < 0 && /^((?!js).*)js/.test(i) && !/^((?!min.js).*)min.js/.test(i)) {
            let dUrl = __dirname + '\\dist' + i;
            checkDirExist(dUrl.slice(0, dUrl.lastIndexOf('\\')));
            if (fs.existsSync(dUrl)) fs.unlinkSync(dUrl);
            let javaExe = "";
            javaExe = "D:\\tool\\IntelliJ IDEA 2019.2.1\\jbr\\bin\\java";
            // javaExe = "C:\\Program Files\\JetBrains\\IntelliJ IDEA 2019.3\\jbr\\bin\\java";
            execSync(`"${javaExe}" -jar closure-compiler-v20200101.jar --js ${'src/main' + i} --js_output_file ${'dist' + i} --compilation_level=SIMPLE --jscomp_warning=* --env=CUSTOM --module_resolution=NODE`, {cwd: process.cwd()});
        }
    }


    //html
    gulp.src('src/main/**/*.html')
        .pipe(gulpRemoveHtml())//清除特定标签
        .pipe(removeEmptyLines({removeComments: true}))//清除空白行
        .pipe(htmlmin({
            removeComments: true,//清除HTML注释
            collapseWhitespace: true,//压缩HTML
            collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
            minifyJS: true,//压缩页面JS
            minifyCSS: true//压缩页面CSS
        }))
        .pipe(gulp.dest(buildBasePath));
});
