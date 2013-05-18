module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.initConfig({
    nodeunit: {
      all: ['test/**/*.js']
    }
  });

  grunt.registerTask('default', ['nodeunit']);
};