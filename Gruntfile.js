module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    engine: 'im',
                    sizes: [{
                        name: 'small',
                        width: '30%',
                        suffix: '_small',
                        quality: 100
                    }, {
                        name: 'large',
                        width: '50%',
                        suffix: '_large',
                        quality: 100
                    }]
                },
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'images_src',
                    dest: 'images/'
                }]
            }
        },
        uglify: {
            my_target: {
                files: {
                    'js/bootstrap.min.js': ['js/bootstrap.js']
                }
            }
        }
    });

    // Load the plugin that provides the "responsive-image" task.
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Default task(s).
    grunt.registerTask('default', ['responsive_images'], ['uglify']);

};