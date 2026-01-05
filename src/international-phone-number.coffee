# Author Marek Pietrucha
# https://github.com/mareczek/international-phone-number

"use strict"
angular.module("internationalPhoneNumber", [])

.constant 'ipnConfig', {
    allowExtensions:        false
    autoFormat:             true
    autoHideDialCode:       true
    autoPlaceholder:        true
    customPlaceholder:      null
    defaultCountry:         ""
    geoIpLookup:            null
    nationalMode:           true
    numberType:             "MOBILE"
    onlyCountries:          []
    preferredCountries:     ['us', 'gb']
    skipUtilScriptDownload: false
    utilsScript:            ""
  }

.directive 'internationalPhoneNumber', ['$timeout', 'ipnConfig', ($timeout, ipnConfig) ->

  restrict:   'A'
  require: '^ngModel'
  scope:
    ngModel: '='
    country: '='

  link: (scope, element, attrs, ctrl) ->

    itiInstance = null

    if ctrl
      if element.val() != ''
        $timeout () ->
          if intlTelInput.getInstance(element[0])
            intlTelInput.getInstance(element[0]).setNumber(element.val())
          else
            console.log('intlTelInput not initialized yet')
          ctrl.$setViewValue element.val()
        , 0


    read = () ->
      ctrl.$setViewValue element.val()

    handleWhatsSupposedToBeAnArray = (value) ->
      if value instanceof Array
        value
      else
        value.toString().replace(/[ ]/g, '').split(',')

    options = angular.copy(ipnConfig)

    angular.forEach options, (value, key) ->
      return unless attrs.hasOwnProperty(key) and angular.isDefined(attrs[key])
      option = attrs[key]
      if key == 'preferredCountries'
        options.preferredCountries = handleWhatsSupposedToBeAnArray option
      else if key == 'onlyCountries'
        options.onlyCountries = handleWhatsSupposedToBeAnArray option
      else if typeof(value) == "boolean"
        options[key] = (option == "true")
      else
        options[key] = option


    if ctrl.$modelValue != null && ctrl.$modelValue != undefined && ctrl.$modelValue.length > 0
      if ctrl.$modelValue[0] != '+'
        ctrl.$modelValue = '+' + ctrl.$modelValue
        element.val(ctrl.$modelValue)
    console.log('about to initialize intlTelInput', element, 'val: ', element.val(), 'modelValue: ', ctrl.$modelValue, 'options: ', options);
    itiInstance = intlTelInput(element[0], options);


    scope.$watch('country', (newValue) ->
        if newValue != null && newValue != undefined && newValue != ''
          intlTelInput.getInstance(element[0]).selectCountry(newValue);
    )

    ctrl.$formatters.push (value) ->
      if !value
        return value

      if intlTelInput.getInstance(element[0])
        intlTelInput.getInstance(element[0]).setNumber(if value.startsWith('+') then value else ('+' + value))
      else
        console.log('intlTelInput not initialized yet', )

      element.val()

    ctrl.$parsers.push (value) ->
      if !value
        return value

      value.replace(/[^\d]/g, '')

    ctrl.$validators.internationalPhoneNumber = (value) ->
      selectedCountry = intlTelInput.getInstance(element[0]).getSelectedCountryData()

      if !value || (selectedCountry && selectedCountry.dialCode == value)
        return true

      intlTelInput.getInstance(element[0]).isValidNumber()

    element.on 'blur keyup change', (event) ->
      scope.$apply read

    element.on '$destroy', () ->
      intlTelInput.getInstance(element[0]).destroy()
      element.off 'blur keyup change'
]
