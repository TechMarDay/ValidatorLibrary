function Validator(options){
    function validate(inputElement, rule){
        var errorMessage;
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);

        var rules = selectorRules[rule.selector];
        for(var i = 0; i < rules.length; i++)
        {
            errorMessage = rules[i](inputElement.value);
            if(errorMessage)
                break;
        }

        if(errorMessage)
        {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        }
        else{
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }

        return !errorMessage;
        //Có lỗi: false, không lỗi: true

    }

    var selectorRules = {};

    var formElement = document.querySelector(options.form);
    if(formElement)
    {
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;

            //Lặp qua từng rule và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });

            if(isFormValid){
                //Trường hợp submit với Javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
        
                        console.log((values[input.name] = input.value));
                        return (values[input.name] = input.value) && values;
                    }, {});

                    options.onSubmit(formValues);
                }
                //Trường hợp submit với hành vi mặc định
                else{
                    formElement.submit();
                }
            }
        }

        //Lặp qua mỗi rule và xử lý (blur, input,...)
        options.rules.forEach(function (rule){
            //Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else
            {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);

            if(inputElement){
                inputElement.onblur = function()
                {
                    validate(inputElement, rule);
                }

                //Xử lý khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        });

        // console.log(selectorRules);
    }
}

Validator.isRequired = function (selector, message){
    return {
        selector: selector,
        test: function (value){
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function (value){
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    };
}

Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function (value){
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiêu ${min} ký tự`;
        }
    };
}

Validator.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function (value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập lại không chính xác';
        }
    };
}