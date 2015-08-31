# QValidator Module, with services and directives.
A complete pack for forms validator, mask fields and messages errors for AngularJS

# Requirements
- ([AngularJS](http://code.angularjs.org/1.4.5/angular.js))

# Testing
We use karma and grunt to ensure the quality of the code.

    npm install -g grunt-cli
    npm install
    bower install
    grunt

# Usage

We use [bower](http://twitter.github.com/bower/) for dependency management.  Add

    dependencies: {
        "qvalidator": "latest"
    }

To your `components.json` file. Then run

    bower install

This will copy the ui-calendar files into your `components` folder, along with its dependencies. Load the script files in your application:

    <script src="bower_components/angular/angular.js"></script>

Add the calendar module as a dependency to your application module:

    var myAppModule = angular.module('MyApp', ['qs.utils'])

Apply the directive to your input elements.

    <input name="n" ng-model="form.n" type="text" style="left: 165px; width: 300px;" onkeydown="tecla()"
             qs-messages="{title: 'Nombre', selectMessages: ['required', 'onlyChars', {minLength: 5}]}" 
             placeholder="Indique su nombre..." autofocus/>
             
    <input name="e" ng-model="form.e" type="email" style="left: 165px; width: 300px;" 
             qs-messages="{title: 'Correo electrónico', selectMessages: ['required', 'onlyChars', {minLength: 5}]}" 
             placeholder="Indique su corrreo electrónico..." required/>
    etc.
    
## Options


