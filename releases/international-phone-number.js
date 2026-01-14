(function() {
  "use strict";
  angular.module("internationalPhoneNumber", []).constant('ipnConfig', {
    allowExtensions: false,
    autoFormat: true,
    autoHideDialCode: true,
    autoPlaceholder: true,
    customPlaceholder: null,
    initialCountry: "",
    geoIpLookup: null,
    nationalMode: true,
    numberType: "MOBILE",
    onlyCountries: [],
    countryOrder: ['us', 'gb'],
    excludeCountries: [],
    skipUtilScriptDownload: false,
    utilsScript: ""
  }).directive('internationalPhoneNumber', [
    '$timeout', 'ipnConfig', function($timeout, ipnConfig) {
      return {
        restrict: 'A',
        require: '^ngModel',
        scope: {
          ngModel: '=',
          country: '='
        },
        link: function(scope, element, attrs, ctrl) {
          var handleWhatsSupposedToBeAnArray, itiInstance, options, read;
          itiInstance = null;
          if (ctrl) {
            if (element.val() !== '') {
              $timeout(function() {
                if (intlTelInput.getInstance(element[0])) {
                  intlTelInput.getInstance(element[0]).setNumber(element.val());
                } else {
                  console.log('intlTelInput not initialized yet');
                }
                return ctrl.$setViewValue(element.val());
              }, 0);
            }
          }
          read = function() {
            return ctrl.$setViewValue(element.val());
          };
          handleWhatsSupposedToBeAnArray = function(value) {
            if (value instanceof Array) {
              return value;
            } else {
              return value.toString().replace(/[ ]/g, '').split(',');
            }
          };
          options = angular.copy(ipnConfig);
          angular.forEach(options, function(value, key) {
            var option;
            if (!(attrs.hasOwnProperty(key) && angular.isDefined(attrs[key]))) {
              return;
            }
            option = attrs[key];
            if (key === 'countryOrder') {
              return options.countryOrder = handleWhatsSupposedToBeAnArray(option);
            } else if (key === 'excludeCountries') {
              return options.excludeCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (key === 'onlyCountries') {
              return options.onlyCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (typeof value === "boolean") {
              return options[key] = option === "true";
            } else {
              return options[key] = option;
            }
          });
          if (ctrl.$modelValue !== null && ctrl.$modelValue !== void 0 && ctrl.$modelValue.length > 0) {
            if (ctrl.$modelValue[0] !== '+') {
              ctrl.$modelValue = '+' + ctrl.$modelValue;
              element.val(ctrl.$modelValue);
            }
          }
          console.log('about to initialize intlTelInput', element, 'val: ', element.val(), 'modelValue: ', ctrl.$modelValue, 'options: ', options);
          itiInstance = intlTelInput(element[0], options);
          scope.$watch('country', function(newValue) {
            if (newValue !== null && newValue !== void 0 && newValue !== '') {
              return intlTelInput.getInstance(element[0]).selectCountry(newValue);
            }
          });
          ctrl.$formatters.push(function(value) {
            if (!value) {
              return value;
            }
            if (intlTelInput.getInstance(element[0])) {
              intlTelInput.getInstance(element[0]).setNumber(value.startsWith('+') ? value : '+' + value);
            } else {
              console.log('intlTelInput not initialized yet');
            }
            return element.val();
          });
          ctrl.$parsers.push(function(value) {
            if (!value) {
              return value;
            }
            return value.replace(/[^\d]/g, '');
          });
          ctrl.$validators.internationalPhoneNumber = function(value) {
            var selectedCountry;
            selectedCountry = intlTelInput.getInstance(element[0]).getSelectedCountryData();
            if (!value || (selectedCountry && selectedCountry.dialCode === value)) {
              return true;
            }
            return intlTelInput.getInstance(element[0]).isValidNumber();
          };
          element.on('blur keyup change', function(event) {
            return scope.$apply(read);
          });
          return element.on('$destroy', function() {
            intlTelInput.getInstance(element[0]).destroy();
            return element.off('blur keyup change');
          });
        }
      };
    }
  ]);

}).call(this);
