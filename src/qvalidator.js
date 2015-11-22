
/*
 * Controla:
 * selectMessages: ['texto', {minLength: 5}, 'required']
 *     "required": {
 *     "restrict": "MDI", // M model, V value, A any, D deleteError, F form, I input 
 *     "validate": "model",
 *     "required": true,
 *     "message": "El campo <i>{{title}}</i> es obligatorio.(json)"
 *  },
 */

( function ( window, angular ) {
  angular.module( "qs.utils.validator", [ ] )

          .value( 'qsMaskConfig', {
            'maskDefinitions': {
              '0': /0/,
              '1': /[0-1]/,
              '2': /[0-2]/,
              '3': /[0-3]/,
              '4': /[0-4]/,
              '5': /[0-5]/,
              '6': /[0-6]/,
              '7': /[0-7]/,
              '8': /[0-8]/,
              '9': /\d/,
              'a': /[a-z]/,
              'A': /[a-zA-Z]/,
              'U': /[A-Z]/,
              '#': /[a-zA-Z0-9]/,
              '*': /[a-zA-Z0-9]/
            }
          } )

          .config( [ 'qsMessagesProviderProvider', function ( qsMessagesProvider ) {
              var msgConfig = {
                service: {
                  include: 'json/messages/messagesText.json',
                  messages: {
                    "required": {
                      "restrict": "MI",
                      "required": true,
                      "message": "El campo <i>{{name}}</i> es obligatorio. (defaultMessages)"
                    },
                    "length": {
                      "restrict": "MI",
                      "length": 3,
                      "message": "El campo <i>{{name}}</i> debe tener {{length}} caracteres."
                    },
                    "minLength": {
                      "restrict": "MI",
                      "minLength": 3,
                      "message": "El campo <i>{{name}}</i> debe tener más de {{minLength}} caracteres."
                    },
                    "maxLength": {
                      "restrict": "MDI",
                      "maxLength": 5,
                      "message": "El campo <i>{{name}}</i> debe tener un máximo de {{maxLength}} caracteres."
                    },
                    "min": {
                      "restrict": "MI",
                      "min": null,
                      "message": "El campo <i>{{name}}</i> debe tener un máximo de {{min}} caracteres."
                    },
                    "max": {
                      "restrict": "MI",
                      "max": null,
                      "message": "El campo <i>{{name}}</i> debe tener un máximo de {{max}} caracteres."
                    },
                    "pattern": {
                      "restrict": "MI",
                      "pattern": null,
                      "message": "El campo <i>{{name}}</i> no contiene un valor válido."
                    }
                  },
                  toolTip: {
                    include: null, // {{placement}}
                    template: '<div class="qsToolTip {{placement}} fade"><div class="qsToolTip-arrow"></div><div class="qsToolTip-inner" ng-bind-html="qsValidator.errorMessage"></div></div>',
                    placement: 'top-left',
                    animation: true,
                    popupDelay: 0,
                    appendToBody: false,
                    isOpen: false
                  },
                  errorAttr: 'error',
                  errorMsgAttr: 'errorMessage'
                },
                input: {
                  //                       qsMask: null,
                  errorAttr: null,
                  errorMsgAttr: null
                } };
              qsMessagesProvider.setConfig( msgConfig );
            } ] )

          .run( [ 'qsMessagesProvider', function ( qsMessagesProvider ) {
              qsMessagesProvider.init();
            } ] )

          .provider( 'qsMessagesProvider', function qsMessagesProvider() {
            var service = null;
            var input = null;
            var serviceOpt = {
              include: 'json/messages/messagesText.json',
              inputs: { },
              messages: { },
              toolTip: {
                element: null
              },
              validators: { },
              errorAttr: null,
              errorMsgAttr: null
            };
            var inputOpt = {
              formName: null,
              inputName: null,
              title: null,
              element: null,
              model: null,
              scope: null,
              isFocus: false,
              selectMessages: null,
              messages: { },
              mask: null,
              errorAttr: null,
              errorMsgAttr: null
            };
            var isInit = false;
            this.setConfig = function ( conf ) {
              service = angular.extend( { }, conf.service, serviceOpt );
              angular.extend( service.messages, conf.service.messages );
              angular.extend( service.toolTip, conf.service.toolTip );

              input = angular.extend( { }, conf.input, inputOpt );
            };
            this.$get = function ( $http, $q ) {
//                this.data = config;
              this.init = function () {
                if ( isInit )
                  return;
                if ( service.include ) {
                  var self = this;
                  this.setMessages( service.messages );
                  var promise = this.readInclude( service.include );
                  promise.then( function ( data ) {
                    self.setMessages( data );
                  } );
                } else {
                  isInit = true;
                }
                if ( service.toolTip.include ) {
                  var self = this;
                  var promise = this.readInclude( service.toolTip.include );
                  promise.then( function ( data ) {
                    service.toolTip.template = data;
                  } );
                } else {
                  isInit = true;
                }
              };
              this.isInit = function () {
                return isInit;
              };
              this.getConfiguration = function () {
                return { service: service, input: input };
              };
              this.getMessage = function ( msgName ) {
                if ( msgName ) {
                  return service.messages[msgName];
                }
              };
              this.setMessage = function ( msgName, msg ) {
                if ( msgName ) {
                  service.messages[msgName] = msg;
                }
              };
              this.getMessages = function () {
                if ( !isInit ) {
                  var promise = this.readInclude();
                  return promise;
                }
                return service.messages;
              };
              this.setMessages = function ( messages ) {
                service.messages = service.messages || { };
                angular.forEach( messages, function ( value, key ) {
                  if ( service.messages[key] ) {
                    angular.forEach( value, function ( v, k ) {
                      service.messages[key][k] = v;
                    } );
                  } else {
                    service.messages[key] = value;
                  }
                } );
                isInit = true;
              };
              this.getInclude = function () {
                return service.include;
              };
              this.readInclude = function ( include ) {
                if ( !service.include )
                  return null;
                var deferred = $q.defer(); // JSONP JSON
                $http( {
                  method: 'GET',
                  url: include
                } ).success( function ( data ) {
//                        console.info("...qsMessagesProvider() data: " + data);
                  deferred.resolve( data );
                } ).error( function ( data, e ) {
                  console.info( "Error!!! : e: " + e );
                  console.info( "Error!!! : data: " + data );
                  deferred.reject( "Error. e: " + e + ", data: " + data );
                } );
                return deferred.promise;
              };
              this.getService = function () {
                return angular.copy( service );
              };
              this.getInput = function () {
                return angular.copy( input );
              };
              return this;
            };
          } )

          .service( 'QSToolTip', [ 'QFileLoader', '$compile', '$position', '$interpolate', '$timeout', '$log', function ( fLoader, $compile, $position, $interpolate, $timeout, $log ) {

              var owner = null;
              var qsToolTip = null;
              var conf = {
                message: null,
                include: null, // {{placement}}
                template: '<div class="qsToolTip {{placement}} fade"><div class="qsToolTip-arrow"></div><div class="qsToolTip-inner" ng-bind-html="qsToolTip.message"></div></div>',
                placement: 'top-left',
                animation: true,
                popupDelay: 0,
                appendToBody: false,
                isOpen: false,
                trigersOn: [ ],
                trigersOff: [ ],
                isHandled: false
              };
              function setConfig( dataConf, elementOwner ) {
                var data = dataConf || { };
                angular.forEach( data, function ( value, key ) {
                  if ( angular.isDefined( conf[key] ) ) {
                    conf[key] = value;
                  }
                } );
                owner = elementOwner || null;
                toolTip = null;
                if ( conf.include ) {
                  readToolTip( conf.include );
                }
              }
              function readToolTip( include ) {
                if ( include ) {
                  fLoader.loadFile( include, function ( data ) {
                    conf.template = data;
                  } );
                }
              }

              this.initService = function ( angElem, dataConf ) {
                // $log.debug("...resetData() name: " + angElem.attr("name"));
                var attr = "";
                attr = angElem.attr( "qs-tooltip" ); // arTooltip
                if ( angular.isDefined( attr ) ) {
                  try {
                    var data = eval( "(" + attr + ")" );
                    data = data.qsToolTip || { };
                    angular.forEach( data, function ( value, key ) {
                      if ( angular.isDefined( conf[key] ) ) {
                        conf[key] = value;
                      }
                    } );
                  } catch ( e ) {
                    if ( attr !== "" && attr.length > 0 && attr.indexOf( ":" ) > 0 ) {
                      alert( "el formato de: '" + attr + "' es incorrecto." );
                      return null;
                    }
                  }
                }
                if ( dataConf ) {
                  setConfig( dataConf, angElem );
                } else {
                  readToolTip( conf.include );
                }
//                    setTrigers(angElem);
                return this;
              };
              this.getData = function () {
                return conf;
              };
              this.setHandled = function ( handled ) {
                conf.isHandled = handled;
              };
              this.isOpen = function () {
                return conf.isOpen;
              };
              this.getToolTip = function () {
                return qsToolTip;
              };
              this.setToolTip = function ( elemOwner, tt, config ) {
                owner = elemOwner || owner;
                qsToolTip = tt || qsToolTip;
                setConfig( config, elemOwner );
              };
              this.setMessage = function ( msg ) {
                //             conf.template = '<div class="qsToolTip {{placement}} fade"><div class="qsToolTip-arrow"></div><div class="qsToolTip-inner">' + msg + '</div></div>';
                conf.template = '<div class="qsToolTip {{placement}} fade"><div class="qsToolTip-arrow"></div><div class="qsToolTip-inner" ng-bind-html="qsToolTip.message"></div></div>';
              };
              this.showMessage = function ( theOwner ) {
                if ( theOwner ) {
                  $timeout( function () {
                    owner = theOwner;
                    var endPos;
//                    if (toolTip) {
//                        toolTip.scope().$digest(); // necesario? parece que no.
//                    }
                    show();
                    endPos = positionTooltip();
                    qsToolTip.css( endPos );
                  }, 0 );
                } else {
                  this.hideMessage();
                }
              };
              this.hideMessage = function () {
                // return; // util para qeu no desaparezca al debugar
                if ( qsToolTip ) {
                  qsToolTip.removeClass( "in" );
                  remove();
                }
                conf.isOpen = false;
              };
              this.removeToolTip = function () { // need conf.isHandled=true
                if ( qsToolTip ) {
                  remove();
                }
              };
              function show() {
                if ( !qsToolTip ) {
                  createToolTip();
                }
                conf.isOpen = true;
                qsToolTip.addClass( "in" );
              }
              function remove() {
                if ( qsToolTip && !conf.isHandled ) {
                  conf.isOpen = false;
                  var old = qsToolTip;
                  qsToolTip = null;
                  $timeout( function () {
                    if ( old ) {
                      // $log.debug("...remove() name: " + qtt.element[0].name);
                      old.remove();
                    }
                  }, 1000 );
                } else {
                  alert( "this.data.remove() this.data.tooltipElem: " + qsToolTip );
                }
              }
              function createToolTip() {
                var ttEndPos, rectTooltip, tt, linkFn = null;
                conf.template = conf.template.replace( "{{placement}}", conf.placement );
                tt = angular.element( conf.template );
                linkFn = $compile( tt );
                qsToolTip = linkFn( owner.scope() );
                owner.scope().$digest();
                // Gestion d ela posicion. parche temporal para AR
                rectTooltip = getRectElement( qsToolTip );
//                var posEle = getRectElement( owner );
//                var left = owner.css('left');
//                $log.info( "left: " + posEle.left + ", top: " + posEle.top + ", left: " + left );
                owner.after( qsToolTip );
                ttEndPos = positionTooltip();
//                ttEndPos.left = left; // lo ajusta para AR, por estar en 3D
                qsToolTip.css( ttEndPos );
              }
              function getRectElement( element ) {
                var ttPosition = $position.position( element );
                ttPosition.top += 'px';
                ttPosition.left += 'px';
                ttPosition.width += 'px';
                ttPosition.height += 'px';
                // $log.debug("arTooltip.getRectElement() tooltipElem: " + angular.toJson(ttPosition));
                // Now set the calculated positioning.
                return ttPosition;
              } // ttPosition: Object  left: 264.7667541503906    top: -16
              function positionTooltip() {
                var ttPosition = $position.positionElements( owner, qsToolTip, conf.placement, conf.appendToBody );
                ttPosition.top += 'px';
                ttPosition.left += 'px';
                //
                var left = owner.css( 'left' );  // lo ajusta para AR, por estar en 3D
                ttPosition.left = left; // lo ajusta para AR, por estar en 3D
                $log.info( "arTooltip.positionTooltip() tooltipElem: " + angular.toJson( ttPosition ) );
                // Now set the calculated positioning.
//      qtt.data.tooltipElem.css(ttPosition);
                return ttPosition;
              }

              this.addTriger = function ( trigerOn, trigerOff, element ) {
                if ( trigerOn && trigerOff ) {
                  ( element || owner ).on( trigerOn, eventToolTipOn );
                  ( element || owner ).on( trigerOn, eventToolTipOff );
                }
              };
              this.removeTriger = function ( triger, element ) {
                if ( triger ) {
                  ( element || owner ).off( triger );
                }
              };
              var eventToolTipOn = function ( event ) {
                $log.debug( "eventToolTipOn() event: " + event.type );
                owner = angular.element( this );
                this.showMessage( null );
              };
              var eventToolTipOff = function ( event ) {
                $log.debug( "eventToolTipOn() event: " + event.type );
                this.hideMessage();
              };
              var onDestroy = function ( event ) {
                $log.debug( "onDestroy() event: " + event.type );
              };
              return this;
            } ] )

          .service( 'QSMessagesService', [ 'qsMessagesProvider', 'QFileLoader', 'QSToolTip', 'qsMask', '$interpolate', '$timeout', '$log', function qsMessages( qsMessagesProvider, fLoader, qsToolTip, qsMask, $interpolate, $timeout, $log ) {
              var service = null;
              var input = null;
              // this;

              initService();
              function initService() {
                service = qsMessagesProvider.getService();
                if ( service.messages.then ) {
                  service.messages.then( function ( msgs ) {
                    $log.debug( "initService sucess... : messages: " + msgs );
                    service.messages = msgs;
                  }, function ( reason ) {
                    $log.debug( "Failed... : reason: " + reason );
                  } );
                }
                defineValidators();
              }

//                function initInput(scope, angElem, attrs, ngModel, config) {
              function initInput( attrs, config ) {
                // $log.debug("...resetData() name: " + angElem.attr("name"));
                //                   var attr = angElem.attr("qs-messages"); // arTooltip

                input = qsMessagesProvider.getInput();
                input.attrObj = attrs;
                input.element = attrs.$$element;
                input.modelCtrl = input.element.controller( 'ngModel' ); // ngModel
                input.scope = input.element.scope(); // scope
                input.formName = input.element[0].form.name;
                input.inputName = input.element[0].name;

                readAttributes( input.attrObj.qsMessages, config );
                if ( input.title === 'submit' && attrs.ngClick ) {
                  var fnName = attrs.ngClick.substr( 0, attrs.ngClick.length - 2 );
                  var fn = input.scope[fnName];
                  input.scope[fnName] = function () {
                    if ( input ) {
                      checkError();
                      if ( input.scope[input.formName].$valid && !input.scope[input.formName].$pristine ) {
                        $log.debug( "init...." + input.title );
                        fn();
                      }
                    }
                  };
                }
                input.scope.qsToolTip = qsToolTip.initService( input.element );

                readSelectionMessages();
                changeMessages();
                defineErrors();
                setTrigersOn( input.element );

                saveInput();
                return input;
              }
              function readAttributes( attr, config ) {
                if ( angular.isDefined( attr ) ) {
                  var attrObj = { };
                  try {
                    attrObj = eval( "(" + ( attr || "{}" ) + ")" );
                    angular.extend( attrObj, ( config || { } ) );
                    angular.forEach( attrObj, function ( value, key ) {
                      if ( angular.isDefined( input[key] ) ) {
                        if ( key === "toolTip" ) {
                          angular.forEach( value, function ( v, k ) {
                            input.toolTip[k] = v;
                          } );
                        } else {
                          input[key] = value;
                        }
                      } else if ( key === "qsMask" ) {
                        input.attrObj.$set( 'qsMask', angular.toJson( value ) );
                        qsMask.initInput( input.attrObj );
                      }
                    } );
                    input.title = input.title || input.element[0].name;
                  } catch ( e ) {
                    if ( attr !== "" && attr.length > 0 && attr.indexOf( ":" ) > 0 ) {
                      alert( "el formato de: '" + attr + "' es incorrecto." );
                      return null;
                    } else {
                      input.title = ( attr && attr.length > 0 ) ? attr : input.element[0].name;
                    }
                  }
                  // copia en selection los mensages standar
                  var sel = [ ], ndx = null;
                  angular.forEach( attrObj, function ( value, key ) {
                    // $log.debug(" directive: 'QValidator.defineMessages' key: " + key);
                    ndx = "required maxLength minLength max min pattern".indexOf( key );
                    if ( ndx === 0 ) {
                      sel.push( key );
                    } else if ( ndx > 0 ) {
                      sel.push( "{" + key + ": " + value + "}" );
                    }
                  } );
                  if ( sel.length > 0 ) {
                    input.selectMessages = sel.concat( input.selectMessages || [ ] );
                  }
                }
              }

              function selectInput( formName, inputName ) {
//                    return angular.element(this).scope().qsValidator;
                if ( !service ) {
                  return;
                }
                input = service.inputs[formName][inputName];
                return input;
              }
              function saveInput() {
                if ( !service ) {
                  return;
                }
                service.inputs[input.formName] = service.inputs[input.formName] || { };
                service.inputs[input.formName][input.inputName] = input;
              }
              function deleteInputName( inputName ) {

              }
              function deleteFormName( formName ) {

              }


              function readMessagesInclude() {
                if ( input.messagesInclude ) {
                  fLoader.loadJSON( input.messagesInclude, function ( data ) {
                    // $log.debug(" directive: '....loadJSON...QValidatorFieldService' messages: " + angular.toJson(qvdata.messages));
                    angular.forEach( data, function ( value, key ) {
                      // $log.debug(" directive: 'QValidator' key: " + key);
                      input.messages[key] = input.messages[key] || { };
                      angular.forEach( value, function ( v, k ) {
                        input.messages[key][k] = v;
                      } );
                    } );
                    setAttrMessages( input );
                    // $log.debug(" directive: 'QValidatorFieldService' messages: " + angular.toJson(qvdata.messages));
                  } );
                } else {
                  setAttrMessages( input );
                }
              }

              /*
               * Controla:
               * selectMessages: ['texto', {minLength: 5}, 'required']
               *     "required": {
               *     "restrict": "MDI", // M model, V value, A any, D deleteError, F form, I input 
               *     "validate": "model",
               *     "required": true,
               *     "message": "El campo <i>{{title}}</i> es obligatorio.(json)"
               *  },
               */
              function readSelectionMessages() {
                if ( !service )
                  return;
                var messages = service.messages;
                if ( messages ) {
                  var msg = null, key = null, id = null, selection = { };
                  angular.forEach( input.selectMessages, function ( value, ndx ) {
                    if ( angular.isObject( value ) ) {
                      id = value.id || Object.keys( value )[0];
                      msg = input.messages[id] || angular.copy( messages[id] );
                      angular.forEach( Object.keys( value ), function ( v ) {
                        if ( angular.isDefined( msg[v] ) ) {
                          msg[v] = value[v];
                        }
                      } );
                      selection[id] = msg;
                      input.selectMessages[ndx] = id;
                    } else {
                      id = value;
                      msg = input.messages[id] || angular.copy( messages[id] );
                      selection[id] = msg;
                    }
                  } );
                  input.messages = selection;
                } else {
                  input.messages = angular.copy( messages );
                }
              }

              function changeMessages() {
                angular.forEach( input.messages, function ( value, key ) {
                  var v = null;
                  var msg = value.message;
                  while ( ( v = msg.match( /{{([^}}]+)/ ) ) ) {
                    if ( v ) {
                      v = v[1];
                      var val = null;
                      if ( v.indexOf( "messages" ) === 0 || v === "title" ) { // this.input level
                        val = eval( "input." + v );
                      } else if ( v.indexOf( "scope" ) === 0 ) { // scope level
                        val = eval( "input.scope." + v.substring( 6 ) );
                      } else {   // message level
                        val = value[v];
                      }
                      msg = msg.replace( "{{" + v + "}}", ( val ? val.toString() : "null" ) );
                      $log.debug( " changeMessages: " + "key: " + key + ", v: '" + v + "', msg: '" + msg + "', val: " + val );
                    }
                  }
                  input.messages[key].message = msg;
                } );
              }

              function defineValidators() {
//                    email: null, number: null, date: null, time: null, datetimelocal: null, week: null, month: null
                var messages = service.messages;
                addValidator( "required", function ( modelValue, viewValue ) {
                  var validator = input.messages["required"];
                  if ( !validator ) {
                    return true;
                  }
                  var restrict = validator.restrict;
                  // var validator = messages["minLength"];
                  // var restrict = input.messages["required"].restrict || "";
                  var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                  var isValid = ( value !== "" );
                  $log.debug( "validation.required : " + isValid );
                  return isValid;
                } );
                addValidator( "length", function ( modelValue, viewValue ) {
                  var validator = input.messages["length"];
                  if ( !validator )
                    return true;
//                        if ((modelValue || viewValue).length > 0 && (modelValue || viewValue).length !== validator["length"]) {
                  var restrict = validator.restrict;
                  var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                  var isValid = ( value.length === validator["length"] );
                  $log.debug( "validation.length : " + isValid + ", value: '" + value + "' == length: " + validator["length"] );
                  return isValid;
                } );
                addValidator( "minLength", function ( modelValue, viewValue ) {
                  var validator = input.messages["minLength"];
                  if ( !validator )
                    return true;
                  var restrict = validator.restrict;
                  var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                  var isValid = value.length > validator["minLength"];
                  $log.debug( "validation.minLength : " + isValid );
                  return isValid;
                } );
                addValidator( "maxLength", function ( modelValue, viewValue ) {
                  var validator = input.messages["maxLength"];
                  if ( !validator )
                    return true;
                  var restrict = validator.restrict;
                  var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                  var isValid = ( value.length > 0 && value.length < validator["maxLength"] );
                  $log.debug( "validation.maxLength : " + isValid );
                  return isValid;
                } );
                addValidator( "min", function ( modelValue, viewValue ) {
                  var validator = input.messages["min"];
                  if ( !validator )
                    return true;
                  var restrict = validator.restrict;
                  var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                  var isValid = value < validator["min"];
                  $log.debug( "validation.min : " + isValid );
                  return isValid;
                } );
                addValidator( "max", function ( modelValue, viewValue ) {
                  var validator = input.messages["max"];
                  var restrict = validator.restrict;
                  var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                  var isValid = value > validator["max"];
                  $log.debug( "validation.max : " + isValid );
                  return isValid;
                } );
                addValidator( "pattern", function ( modelValue, viewValue ) {
                  var validator = input.messages["pattern"];
                  if ( !validator )
                    return true;
                  var restrict = validator.restrict;
                  var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                  var reg = new RegExp( validator["pattern"] );
                  var isValid = reg.test( value );
                  $log.debug( "validation.pattern : " + isValid );
                  return isValid;
                } );
              }
              function addValidator( name, fnValidator ) {
                if ( name && fnValidator ) {
                  service.validators[name] = fnValidator;
                }
              }
              function getValidator( validatorName ) {
                return service.validators[validatorName];
              }
              function defineErrors() {
                // $log.debug("QValidatorFieldService.defineErrors: " + qvdata.element.attr("name"));
                if ( !input.modelCtrl ) {
                  return;
                }
                var messages = input.messages;
                var ngModel = input.modelCtrl;
                var fnValidator = null;

                angular.forEach( messages, function ( theValidator, name ) {
                  fnValidator = getValidator( name );
                  if ( fnValidator ) {
                    ngModel.$validators[name] = fnValidator;
                  } else if ( theValidator.function ) {
                    ngModel.$validators[name] = function ( modelValue, viewValue ) {
                      // $log.debug("ngModel.$validators." + key + ": value: " + (modelValue || viewValue) + ", modelValue: '" + modelValue + "', viewValue: '" + viewValue + "'");
                      var validator = input.messages[name];
                      if ( !validator )
                        return true;
                      var isValid = eval( "scope['" + validator.function + "']( " + modelValue + ", " + viewValue + ")" );
                      $log.debug( "validation." + name + ": " + isValid );
                      return isValid;
                    };
                  } else {
                    ngModel.$validators[name] = function ( modelValue, viewValue ) {
                      $log.debug( "validation." + name );
                      // $log.debug("ngModel.$validators." + key + ": value: " + (modelValue || viewValue) + ", modelValue: '" + modelValue + "', viewValue: '" + viewValue + "'");
                      var validator = input.messages[name];
                      if ( !validator )
                        return true;
                      var restrict = validator.restrict || "";
                      var value = ( restrict.indexOf( "A" ) > -1 ) ? ( modelValue || viewValue ) : ( restrict.indexOf( "M" ) > -1 ) ? modelValue : viewValue;
                      var reg = new RegExp( validator[name] );
                      var isValid = reg.test( value );
                      $log.debug( "validation." + name + ": " + isValid );
                      return isValid;
                    };
                  }
                } );
              }
              /*
               function removeTrigers() {
               self.data.element.off( "focus" );
               self.data.element.off( "blur" );
               self.data.element.off( "keyup" );
               }
               */
              function parseAngularTag( tag ) {
                var tagFn = $interpolate( tag );
                var result = input.scope.$eval( tagFn );
                return result;
              }
              function checkError() {
                var error = input.formName + ( input.inputName ? "." + input.inputName : "" );
                error = parseAngularTag( "{{" + error + ".$error}}" );
                if ( !error && input.messages.required.required && input.element.prop( 'value' ) === "" && input.focused ) {
                  error = '{"required": true}';
                }
                input.error = "";
                if ( error && error !== "{}" ) {
                  error = angular.fromJson( error );
                  processError( error );
                  input.element.addClass( "ng-invalid" );
                } else {
                  self.hideMessage();
                  input.element.removeClass( "ng-invalid" );
                }
              }
              function checkErrorsInForm( formName ) {
                var msgs = [ ];
                var inputs = service.inputs[formName];
                var currInput = input;
                angular.forEach( inputs, function ( inpt ) {
                  if ( inpt.error ) {
                    msgs.push( inpt.messages[inpt.error].message );
                  } else {
//                            input = inpt;
//                            checkError();
                    if ( inpt.messages.required && inpt.messages.required.required && inpt.element.prop( 'value' ) === "" ) {
//                            if (inpt.error) {
                      inpt.error = 'required';
                      msgs.push( inpt.messages[inpt.error].message );
                    }
                  }
                } );
                input = currInput;
                return msgs;
              }
              function getErrorMessages( error ) {
                var msgs = [ ];
                angular.forEach( input.selectMessages, function ( value, ndx ) {
                  if ( error[value] && input.messages[value].restrict.indexOf( "I" ) > -1 ) {
                    input.error = value;
                    msgs.push( input.messages[value].message );
                  } else {
                    input.error = '';
                  }
                } );
                return msgs;
              }
              function processError( error ) {
                var msgs = [ ];
                var deleteError = false;
                if ( error ) {
                  $log.debug( "arTooltip.processError() error: " + angular.toJson( error ) );
                  /*
                   *  Duda: mostrar solo uno o más mensajes de error...
                   */
                  $log.debug( "arTooltip.processError() error: " + angular.toJson( error ) );

                  angular.forEach( input.selectMessages, function ( value, ndx ) {
                    if ( error[value] && input.messages[value].restrict.indexOf( "F" ) > -1 ) {
                      input.error = value;
                    }
                    if ( error[value] && input.messages[value].restrict.indexOf( "I" ) > -1 ) {
                      msgs.push( input.messages[value].message );
                      deleteError = deleteError || input.messages[value].deleteError;
                      $log.debug( "processError() key: " + value + ", msg: " + input.messages[value].message );
                    }
                  } );

                  if ( deleteError ) {
                    input.element.prop( "value", input.element.prop( "value" ).substring( 0, input.element.prop( "value" ).length - 1 ) );
                  }
                  if ( msgs.length > 0 ) {
                    self.showMessage( msgs );
                  } else {
                    hideMessage();
                  }
                }
              }

              function showMessage( msg ) {
                input.scope.qsToolTip.messages = msg;
                input.scope.qsToolTip.message = msg[0];
                qsToolTip.showMessage( input.element );
              }

              function hideMessage() {
                qsToolTip.hideMessage();
                input.scope.qsToolTip.message = "";
                input.scope.qsToolTip.messages = [ ];
              }

// qsToolTip
              function readToolTip() {
                if ( service.toolTip.include ) {
                  fLoader.loadFile( service.toolTip.include, function ( data ) {
                    service.toolTip.template = data;
                  } );
                }
              }

// Events
              function setTrigersOn( angElem ) {
//                    angElem.on("click", qsMsgClick);
                angElem.on( "focus", qsMsgFocus );
                angElem.on( "blur", qsMsgBlur );
//              angElem.on( "keyup", qsMsgKeyUp );
//              angElem.scope().$on( '$destroy', onDestroy);
                angElem.on( '$destroy', qsMsgDestroy );
              }
              function setTrigersOff( angElem ) {
                angElem.off( "focus" );
                angElem.off( "blur" );
//              angElem.off( "keyup" );
//                    angElem.scope().$on('$destroy', onDestroy);
              }
              function qsMsgClick( evt ) {
                evt.preventDefault();
                evt.stopPropagation();
                $log.debug( "...click() name: " + this.name );
                $log.debug( "...click() name: " + input.title );
                if ( input.title === 'submit' ) {

                }

              }
              function qsMsgFocus( evt ) {
                $log.debug( "...focus() name: " + this.name );
                evt.preventDefault();
                evt.stopImmediatePropagation();
                input = selectInput( this.form.name, this.name );
                input.isFocus = true;
                checkError();
                input.element.on( "keyup", qsMsgKeyUp );
              }
              function qsMsgBlur( evt ) {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                input.isFocus = false;
                // $log.debug("...blur() name: " + self.name);
                if ( qsToolTip.isOpen() ) {
                  qsToolTip.hideMessage();
                }
                saveInput( input );
                angular.element( input.element ).on( "keyup" );
                input = null;
              }
              function qsMsgKeyUp( evt ) {
                checkError();
              }
              function onDestroyElement( evt ) {
                var angElem = angular.element( this );
                angElem.off( "focus" );
                angElem.off( "blur" );
//              angElem.off( "keyup" );
              }

              function qsMsgDestroy( evt ) {
                // $log.debug("$destroy name: " + self.data.element[0].name);
                //    removeTrigers();  // verificar si necesario.. parece obsoleto.
                qsToolTip.removeToolTip();
                onDestroyElement( evt );
//              setTrigersOff();
//              service = null;
//              input = null;
              }

              //               return this;
              var self = {
                initInput: initInput,
                saveInput: saveInput,
                selectInput: selectInput,
                showMessage: showMessage,
                hideMessage: hideMessage,
                checkErrorsInForm: checkErrorsInForm,
                resetService: qsMsgDestroy
              };
              return self;
            } ] )

          .service( 'qsMask', [ 'qsMaskConfig', '$timeout', '$log', function ( maskConfig, $timeout, $log ) {
              $log.debug( "qsMask.link" );
//                var options = maskConfig;
              var service = null;
              var input = null;
              service = {
                inputs: { },
                maskConfig: maskConfig.maskDefinitions
              };
              input = {
                element: null,
                ctrlModel: null,
                scope: null,
                model: null,
                mask: null,
                maskComponents: null,
                maskHolder: null,
                maskPatterns: null,
                caret: {
                  v2mMap: null,
                  m2vMap: null,
                  vPos: 0,
                  mPos: 0
                },
                errorMsgs: [ {
                    start: 0,
                    end: 0,
                    atModel: true,
                    errorName: "badCharacter"
                  } ],
                modelValue: null,
                viewValue: null,
                maxModelLength: 0,
                maxViewLength: 0,
                minRequiredLength: 0
              };

              initService();
              function initService() {
//                service = {
//                  maskConfig: maskConfig.maskDefinitions
//                };
              }
              function initInput( attrs, config ) {
                input.attrObj = attrs;
                input.element = attrs.$$element;
                input.modelCtrl = input.element.controller( 'ngModel' );
                input.scope = input.element.scope(); // scope
                input.model = attrs.ngModel; // ngModel
                input.name = input.element[0].name;
                input.formName = input.element[0].form.name;
                setFormater( formatter );
                setParser( parser );
                saveInput();
                input.attrObj.$observe( 'qsMask', function ( maskAttr ) {
//                  var name = input.name;
                  readAttributes( input.element[0].form.name, input.element[0].name, maskAttr );
                } );
//                    input.attrObj.$observe('placeholder', initPlaceholder);
//                    input.element.bind('mousedown mouseup', mouseDownUpHandler);

//                service[input.name] = input;
                setTrigersOn( input.element );
                saveInput();
                return input;
              }

              function initializeElement() {
//                    input.modelCtrl.$modelValue = getModelValueFromView(input.element.val());
                var value = getModelValueFromView( input.modelCtrl.$modelValue || '' );
                var valueMasked = maskValue( value );
                var isValid = validateValue( value );
                var viewValue = isValid && value.length ? valueMasked : '';
                input.element.val( viewValue );
                input.element.attr( 'placeholder', input.maskHolder );
                input.element.val( viewValue );
                input.modelCtrl.$viewValue = viewValue;
                /*
                 value = oldValueUnmasked = getModelValueFromView(controller.$modelValue || '');
                 valueMasked = oldValue = maskValue(value);
                 isValid = validateValue(value);
                 var viewValue = isValid && value.length ? valueMasked : '';
                 if (iAttrs.maxlength) { // Double maxlength to allow pasting new val at end of mask
                 iElement.attr('maxlength', maskCaretMap[maskCaretMap.length - 1] * 2);
                 }
                 iElement.attr('placeholder', maskHolder);
                 iElement.val(viewValue);
                 controller.$viewValue = viewValue;
                 // Not using $setViewValue so we don't clobber the model value and dirty the form
                 // without any kind of user interaction.
                 */
              }

              function readAttributes( formName, name, attr, config ) {
                var attrObj = attr || { };

//                input = service[name];
                input = selectInput( formName, name );
                if ( angular.isDefined( attr ) ) {
                  if ( angular.isDefined( attr.qsMask ) ) {
                    attrObj = attr.qsMask;
                  }
                  try {
                    attrObj = eval( "(" + ( attrObj || "{}" ) + ")" );
                    if ( angular.isDefined( attrObj.qsMask ) ) {
                      attrObj = attrObj.qsMask;
                    }
                    angular.extend( attrObj, ( config || { } ) );
                    angular.forEach( attrObj, function ( value, key ) {
                      if ( angular.isDefined( input[key] ) ) {
                        input[key] = value;
                      }
                    } );
                  } catch ( e ) {
                    if ( attr !== "" && attr.length > 0 && attr.indexOf( ":" ) > 0 ) {
                      alert( "el formato de: '" + attr + "' es incorrecto." );
                      return null;
                    } else { // string simple con la mask
                      input.mask = attr || "";
                    }
                  }
                } else {
                  return; // uninitialize();
                }
                input.maskHolder = input.maskHolder || attr.placeholder;
                qs_processRawMask( input.mask ); // mio
                if ( !input.maskPatterns ) {
                  return; // uninitialize();
                }
//                    initializeElement();
                var value = getModelValueFromView( input.modelCtrl.$modelValue || '' );
                var valueMasked = getViewValueFromModel( value );
                var isValid = validateValue( value );
                var viewValue = isValid && value.length ? valueMasked : '';
                input.element.val( viewValue );
//                    input.element.attr('placeholder', input.maskHolder);
                input.modelCtrl.$viewValue = viewValue;
                saveInput();
                setTrigersOn( input.element );
                return true;
              }

              function validateValue( value ) {
                // Zero-length value validity is ngRequired's determination
                $log.debug( "...validateValue() value: " + value + ", minRequiredLength: " + input.minRequiredLength );
                $log.debug( "...validateValue() isValid: " + ( value.length ? value.length >= input.minRequiredLength : true ) );
                return value.length ? value.length >= input.minRequiredLength : true;
              }

              function setFormater( formater ) {
                input.modelCtrl.$formatters.push( formatter );
              }
              function setParser( parser ) {
                input.modelCtrl.$parsers.push( parser );
              }
              function formatter( fromModelValue ) { // Model to View
                if ( !input.maskPatterns ) {
                  return fromModelValue;
                }
                input.modelValue = fromModelValue;
                input.viewValue = getViewValueFromModel( fromModelValue );
                $log.debug( "--------------------------------------------------------------" );
                $log.debug( "formatter() fromModelValue: " + fromModelValue + ", viewValue: " + input.viewValue + ", $viewValue: " + input.modelCtrl.$viewValue );
                $log.debug( "formatter() fromModelValue: " + fromModelValue + ", modelValue: " + input.modelValue + ", $modelValue: " + input.modelCtrl.$modelValue );
                return input.viewValue;
//                    return isValid && value.length ? maskValue(value) : undefined;
              }
              function parser( fromViewValue ) {   // View to Model
                if ( !input.maskPatterns ) {
                  return fromViewValue;
                }
                input.viewValue = fromViewValue;
                input.modelValue = getModelValueFromView( fromViewValue || '' );
                $log.debug( "--------------------------------------------------------------" );
                $log.debug( "parser() fromViewValue: " + fromViewValue + ", viewValue: " + input.viewValue + ", $viewValue: " + input.modelCtrl.$viewValue );
                $log.debug( "parser() fromViewValue: " + fromViewValue + ", modelValue: " + input.modelValue + ", $modelValue: " + input.modelCtrl.$modelValue );
                return input.modelValue.length ? input.modelValue : '';
              }

              function getModelValueFromView( value ) {
                var valueUnmasked = '', maskPatternsCopy = input.maskPatterns.slice();
                // Preprocess by stripping mask components from value
                value = value.toString();
                angular.forEach( input.maskComponents, function ( component ) {
                  value = value.replace( component, '' );
                } );
                angular.forEach( value.split( '' ), function ( chr ) {
                  if ( maskPatternsCopy.length && maskPatternsCopy[0].test( chr ) ) {
                    valueUnmasked += chr;
                    maskPatternsCopy.shift();
                  }
                } );
                return valueUnmasked;
              }
              function getViewValueFromModel( unmaskedValue ) {
                var valueMasked = '', maskCaretMapCopy = input.caret.m2vMap.slice();
                angular.forEach( input.maskHolder.split( '' ), function ( chr, i ) {
                  if ( unmaskedValue.length && i === maskCaretMapCopy[0] ) {
                    valueMasked += unmaskedValue.charAt( 0 ) || '_';
                    unmaskedValue = unmaskedValue.substr( 1 );
                    maskCaretMapCopy.shift();
                  } else {
                    valueMasked += chr;
                  }
                } );
                return valueMasked;
              }

              function getMaskComponents() {
                return input.maskHolder.replace( /[_]+/g, '_' ).replace( /([^_]+)([a-zA-Z0-9])([^_])/g, '$1$2_$3' ).split( '_' );
              }
              function qs_processRawMask( mask ) {
                var vCharCount = 0, mCharCount = 0;
                input.maskPatterns = [ ];
                input.caret.v2mMap = [ ];
                input.caret.m2vMap = [ ];
                input.maskHolder = input.maskHolder || "";
                if ( typeof mask === 'string' ) {
                  input.minRequiredLength = 0;
                  var isOptional = false;
                  var splitMask = mask.split( '' );
                  angular.forEach( splitMask, function ( chr, i ) {
                    if ( service.maskConfig[chr] ) {
                      input.caret.m2vMap.push( vCharCount ); // mio
                      input.caret.v2mMap.push( mCharCount );
                      input.maskHolder += input.maskHolder ? input.maskHolder[i] || ' ' : ' ';
                      input.maskPatterns.push( service.maskConfig[chr] );
                      input.maxModelLength++;
                      vCharCount++;
                      mCharCount++;
                      if ( !isOptional ) {
                        input.minRequiredLength++;
                      }
                    } else if ( chr === '?' ) {
                      isOptional = true;
                    } else {
                      input.caret.v2mMap.push( mCharCount );
                      input.maskHolder += chr;
                      vCharCount++;
                    }
                  } );
                }
                // Caret position immediately following last position is valid.
                input.caret.v2mMap.push( input.caret.v2mMap.slice().pop() + 1 );
                input.caret.m2vMap.push( input.caret.m2vMap.slice().pop() + 1 );
                input.maskComponents = getMaskComponents();
              }
              function getErrorMessageForModelPos( mPos ) {
                var errorName = null, errObj = null;
//                    angular.forEach(input.errorMsgs, function(err,ndx) {
                for ( var x = 0; x < input.errorMsgs.length; x++ ) {
                  errObj = input.errorMsgs[x];
                  if ( mPos >= errObj.start && ( mPos <= errObj.end || errObj.end > 0 ) ) {
                    errorName = errObj.errorName;
                    x = input.errorMsgs.length;
                  }
                }
                return errorName;
              }
              function qs_checkValidChar( charStr ) {
                var mPos = Math.min( input.caret.mPos, input.maxModelLength - 1 );
                var isValid = true;
                var errName = getErrorMessageForModelPos( mPos );
                if ( !input.maskPatterns[mPos] || !input.maskPatterns[mPos].test( charStr ) ) {
                  isValid = false;
                  $log.debug( "char: NO:  ->" + charStr + "<-" );
                }
                input.modelCtrl.$setValidity( errName, isValid );
                return isValid;
              }
              function updateValue() {
                if ( input.modelValue !== input.modelCtrl.$modelValue ) {
                  input.viewValue = getViewValueFromModel( input.modelValue );
                  $log.debug( "updateValue() modelValue: " + input.modelValue + ", $modelValue: " + input.modelCtrl.$modelValue );
                  input.scope.$apply( function () {
                    input.scope.$eval( input.model + "='" + input.modelValue + "'" );
                  } );
                } else if ( input.viewValue !== input.modelCtrl.$viewValue ) {
                  input.viewValue = getViewValueFromModel( input.modelValue );
                  $log.debug( "updateValue() viewValue: " + input.viewValue + ", $viewValue: " + input.modelCtrl.$viewValue );
                  input.scope.$apply( function () {
                    input.modelCtrl.$setViewValue( input.viewValue );
                  } );
                } else {
                  $log.debug( "updateValue() no upadate. modelValue: " + input.modelValue + ", viewValue: " + input.viewValue );
                }

              }
              function initCaret() {
                input.viewValue = input.element.val(); // input.element[0].value
                input.modelValue = getModelValueFromView( input.viewValue );
                input.caret.vPos = qs_getSelectionStart();
                input.caret.mPos = Math.min( input.modelValue.length, input.caret.v2mMap[input.caret.vPos] );
                input.caret.vPos = input.caret.m2vMap[input.caret.mPos];
                setCaretPosition( input.caret.vPos );
                return input.caret.mPos;
              }
              function qs_getSelectionStart() {
                var ele = input.element[0];
                var vPos = 0;
                if ( ele.createTextRange ) { // IE
                  var r = document.selection.createRange().duplicate();
                  r.moveEnd( 'character', ele.value.length );
                  if ( r.text === '' ) {
                    vPos = ele.value.length;
                  } else {
                    vPos = ele.value.lastIndexOf( r.text );
                  }
                } else { // no IE
                  vPos = ele.selectionStart;
                }
                return Math.min( vPos, input.caret.v2mMap.length - 1 );
              }
              function qs_getSelectionEnd() {
                var ele = input.element[0];
                if ( ele.createTextRange ) {
                  var r = document.selection.createRange().duplicate();
                  r.moveStart( 'character', -ele.value.length );
                  return r.text.length;
                } else
                  return ele.selectionEnd;
              }
              function setCaretPosition( pos ) {
                var ele = input.element[0];
                if ( ele.offsetWidth === 0 || input.offsetHeight === 0 ) {
                  return; // Input's hidden
                }
                $timeout( function () {
                  if ( ele.setSelectionRange ) {
                    ele.focus();
                    ele.setSelectionRange( pos, pos );
                  } else if ( ele.createTextRange ) {
                    // Curse you IE
                    var range = ele.createTextRange();
                    range.collapse( true );
                    range.moveEnd( 'character', pos );
                    range.moveStart( 'character', pos );
                    range.select();
                  }
                }, 0 );
              }

              function updateCaret( mPos ) {
                input.caret.mPos = Math.max( 0, mPos );
                input.caret.mPos = Math.min( Math.min( input.modelValue.length, input.maxModelLength ), input.caret.mPos );
                input.caret.vPos = input.caret.m2vMap[input.caret.mPos];
                setCaretPosition( input.caret.vPos );
                return input.caret.mPos;
              }

              function selectInput( formName, name ) {
//                    return angular.element(this).scope().qsValidator;
                if ( !service ) {
                  return;
                }
                input = service.inputs[formName][name];
                return input;
              }
              function saveInput() {
                if ( !service ) {
                  return;
                }
                service.inputs[input.formName] = service.inputs[input.formName] || { };
                service.inputs[input.formName][input.name] = input;
              }

// Events
              function setTrigersOn( angElem ) {
                angElem.on( "focus", qsMaskFocus );
                angElem.on( "blur", qsMaskBlur );
                angElem.on( '$destroy', qsMaskDestroy );
              }
              function setTrigersOff( angElem ) {
                angElem.off( "focus" );
                angElem.off( "blur" );
//              angElem.off( "keyup" );
//                    angElem.scope().$on('$destroy', qsMsgDestroy);
              }

              function qsMaskBlur( e ) {
//                service[this.name] = input;
                input.element.off( 'keydown' );  // keydown  keyup qsMaskKeypress
                input.element.off( 'click' );
                input.element.off( 'keyup' );
                input.element.off( 'keypress' );
                saveInput();
                input.isFocus = false;
//                setTrigersOff;
              }
              function qsMaskFocus( e ) {
//                input = service[this.name];
//                setTrigersOn;
                input = selectInput( this.form.name, this.name );
                input.isFocus = true;

                input.element.on( 'click', qsMaskClick );  // keydown  keyup qsMaskKeypress
                input.element.on( 'keydown', qsMaskKeyDown );  // keydown  keyup qsMaskKeypress
                input.element.on( 'keyup', qsMaskKeyUp );  // keydown  keyup qsMaskKeypress
                input.element.on( 'keypress', qsMaskKeypress );
                initCaret();
              }
              function qsMaskClick( e ) {
//                e.preventDefault();
//                initCaret();
              }
              function qsMaskKeypress( e ) {
                e = e || window.event;
                if ( e.stopImmediatePropagation ) {
                  e.stopImmediatePropagation();
                } else if ( e.stopPropagation ) {
                  // W3C standard variant
                  e.stopPropagation();
                } else {
                  // IE variant
                  e.cancelBubble = true;
                }
                e.preventDefault();
                var charCode = e.which || e.keyCode;
                var charStr = String.fromCharCode( charCode );
                $log.debug( "char: " + charStr );

                $log.debug( "--" + e.type + "------------------------------------------------------------" );
                if ( charCode === 13 ) {
                  onReturn( e );
                  return;
                } else if ( !qs_checkValidChar( charStr ) ) {
                  $log.debug( "char: NO: " + charStr );
                  return false;
                }

                input.modelValue = input.modelValue.substr( 0, Math.min( input.caret.mPos, input.maxModelLength - 1 ) ) + charStr + input.modelValue.substr( input.caret.mPos );
                if ( input.modelValue.length > input.maxModelLength ) {
                  input.modelValue = input.modelValue.substr( 0, input.maxModelLength );
                }
                updateValue();
                input.caret.mPos++;
                updateCaret( input.caret.mPos );
                $log.debug( "qsMaskKeypress() modelValue: '" + input.modelValue + "', $modelValue: '" + input.modelCtrl.$modelValue + "'" );
                $log.debug( "qsMaskKeypress() viewValue: '" + input.viewValue + "', $viewValue: '" + input.modelCtrl.$viewValue + "'" );
              }
              function qsMaskKeyUp( e ) {
                $log.debug( "--" + e.type + "------------------------------------------------------------" );
                $log.debug( "qsMaskKeyUp() modelValue: " + input.modelValue + ", $modelValue: " + input.modelCtrl.$modelValue );
                $log.debug( "qsMaskKeyUp() viewValue: " + input.viewValue + ", $viewValue: " + input.modelCtrl.$viewValue );
                $log.debug( "qsMaskKeyUp() 1.1. viewVal: " + input.viewValue.substr( 0, input.caret.vPos ) + "|" + input.viewValue.substr( input.caret.vPos ) );
              }
              function qsMaskKeyDown( e ) {
                $log.debug( "--" + e.type + "------------------------------------------------------------" );
                var mPos = 0;
                mPos = initCaret();
                var key = e.which || e.keyCode;
//                    $log.debug("qsMaskKeyDown() 0. vPos: " + vPos + ", mPos: " + mPos);
                $log.debug( "qsMaskKeyDown() 0. mPos: " + mPos );

                switch ( key ) {
                  case 37:  // <-
                    mPos--;
                    e.preventDefault();
                    break;
                  case 39:  // ->
                    mPos++;
                    e.preventDefault();
                    break;
                  case 46:  // delete
                    input.modelValue = input.modelValue.substr( 0, mPos ) + input.modelValue.substr( mPos + 1 );
                    e.preventDefault();
                    break;
                  case 8:   // backSpace
                    mPos--;
                    input.modelValue = input.modelValue.substr( 0, mPos ) + input.modelValue.substr( mPos + 1 );
                    e.preventDefault();
                    break;
                  case 13: // return
                    break;
                }
                updateValue();
                mPos = updateCaret( mPos );

//                    $log.debug("qsMaskKeyDown() 0.1. vPos: " + vPos + ", mPos: " + mPos);
                $log.debug( "qsMaskKeyDown() 0.1. mPos: " + mPos );
                $log.debug( "qsMaskKeyDown() 1.1. modelVal: " + input.modelValue.substr( 0, mPos ) + "|" + input.modelValue.substr( mPos ) );

              }
              function qsMaskDestroy( e ) {
                var angEle = angular.element( this );
                angEle.on( 'blur', qsMaskBlur );
                angEle.on( 'keydown', qsMaskKeyDown );  // keydown  keyup qsMaskKeypress
                angEle.on( 'keyup', qsMaskKeyUp );
                angEle.on( 'click', qsMaskClick );
              }
              var self = {
                initInput: initInput,
                setFormater: setFormater,
                setParser: parser,
                getModelValueFromView: getModelValueFromView,
                getViewValueFromModel: getViewValueFromModel
              };
              return self;

            } ] )

          .directive( 'qsMessages', [ 'QSMessagesService', 'QSToolTip', function ( qsMessagesService, qsToolTip ) {  // 3:15
              return {
                restrict: 'A',
//                    require: '?ngModel',
                controller: function ( $scope, $element, $attrs ) {
                  qsMessagesService.initInput( $attrs );
                },
                link: function ( scope, element, attrs, ngModel ) {
                  // $log.debug("QValidatorField.link: " + element.attr("name"));
//                scope.testScope = "ok!! name: " + element[0].name;
                  scope.element = element;
                  if ( attrs.autofocus ) {
                    element[0].focus();
                  }
                }
              };
            } ] )

          .service( 'QFileLoader', [ '$http', '$templateCache', function ( $http, $templateCache, $log ) {
              this.loadFile = function ( fileName, succesCallBack, errorCallBack ) {
                var fnSucc = succesCallBack ? succesCallBack : null;
                var fnError = errorCallBack ? errorCallBack : null;
                $http( { method: 'POST', url: fileName } )
                        .success( function ( res, status ) {
                          if ( fnSucc ) {
                            fnSucc( res );
                          } else {
                            alert( "Ok fileName: " + fileName + "\nresult: " + res.data );
                          }
                        } )
                        .error( function ( res, status ) {
                          if ( fnError ) {
                            fnError( res );
                          } else {
                            alert( "error: fileName: " + fileName + "\nresult: " + res.data );
                          }
                        } );
              };
              this.loadJSON = function ( fileName, succesCallBack, errorCallBack ) {
                var fnSucc = succesCallBack ? succesCallBack : null;
                var fnError = errorCallBack ? errorCallBack : null; // JSONP
                $http( { method: 'POST', url: fileName } ) // , cache: $templateCache
                        .success( function ( res, status ) {
                          $log.debug( " service: 'QFileLoader' res: " + res + ", status: " + status );
                          if ( fnSucc ) {
                            fnSucc( res, status );
                          } else {
                            alert( "Ok fileName: " + fileName + "\nresult: " + res.data );
                          }
                        } )
                        .error( function ( res, status ) {
                          $log.debug( " service: 'QFileLoader' res: " + res + ", status: " + status );
                          if ( fnError ) {
                            fnError( res, status );
                          } else {
                            alert( "error: fileName: " + fileName + "\nresult: " + res );
                          }
                        } );
              };
            } ] );
} )( window, window.angular );

