module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'client/scripts/main.js',
                dest: 'server/public/assets/scripts/main.min.js'
            },
            controllers: {
                src: "client/scripts/controllers/controller.js",
                dest: "server/public/assets/scripts/controllers/controller.min.js"
            }
        },
        copy: {
            angular: {
                expand: true,
                cwd: 'node_modules',
                src: [
                    "angular/angular.min.js",
                    "angular/angular.min.js.map"

                ],
                "dest": "server/public/vendors/"
            },
            angularRoute: {
                expand: true,
                cwd: 'node_modules',
                src: [
                    "angular-route/angular-route.min.js",
                    "angular-route/angular-route.min.js.map"

                ],
                "dest": "server/public/vendors/"
            },
            rtc: {
                expand: true,
                cwd: 'node_modules',
                src: [
                    "rtc/dist/rtc.min.js",
                    "rtc/dist/rtc.min.js.map"
                ],
                "dest": "server/public/vendors/"
            },

            jquery: {
                expand: true,
                cwd: 'node_modules',
                src: [
                    'jquery/dist/jquery.js',
                    'jquery/dist/jquery.min.js',
                    'jquery/dist/jquery.min.map'
                ],
                "dest": "server/public/vendors/"
            },
            socketio: {
                expand: true,
                cwd: 'node_modules',
                src: [
                    'socket.io-client/socket.io.js'
                ],
                "dest": "server/public/vendors"
            },
            html: {
                expand: true,
                cwd: "client",
                src: "views/index.html",
                dest: "server/public/assets/"
            },
            htmlRoutes: {
                expand: true,
                cwd: "client",
                src: [
                    "views/routes/home.html",
                    "views/routes/lobby.html",
                    "views/routes/videochat.html"
                ],
                dest: "server/public/assets/"
            },
            style: {
                expand: true,
                cwd: 'client',
                src: [
                    "styles/style.css"
                ],
                "dest": "server/public/assets"
            },
            bootstrap: {
                expand: true,
                cwd: "node_modules/",
                src: [
                    "bootstrap/dist/css/bootstrap.min.css.map",
                    "bootstrap/dist/css/bootstrap.min.css",
                    "bootstrap/dist/js/bootstrap.min.js"
                ],
                "dest": "server/public/vendors/"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['copy', 'uglify']);
};