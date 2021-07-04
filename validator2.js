function Validator(formSelector){
    // //ES5 gan gia tri mac dinh cho tham so
    // if(!options){
    //     options = {};
    // }
    var _this = this;
    var formRules = {};

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            else{
                element = element.parentElement;
            }
        }
    }

    /*
    Quy ước tạo rule:
    - Nếu có lỗi thì return `error message`
    - Nếu không có lỗi thì return `undefined`
    */
   var ValidatorRules = {
        required: function(value){
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function(value){
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        },
        min: function(min){
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`;
            };
        },
        max: function(max){
            return function(value){
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} ký tự`;
            };
        }
   };
    var formElement = document.querySelector(formSelector);
    
    if(formElement){
        var inputs = formElement.querySelectorAll("[name][rules]");
        for(var input of inputs)
        {
            var rules = input.getAttribute("rules").split('|');
            for(var rule of rules){

                var isRuleHasValue = rule.includes(':');
                var ruleInfo;

                if(isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                    // console.log(ValidatorRules[rule](ruleInfo[1]));
                }

                var ruleFunc = ValidatorRules[rule];
                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }
                
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                }
                else{
                    formRules[input.name] = [ruleFunc];
                }
            }

            //Lang nghe su kien de validate (blur, change,..)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        function handleValidate(event){
            var rules = formRules[event.target.name];
            var errorMessage;
            rules.some(function(rule){
                errorMessage = rule(event.target.value);
                return errorMessage;
            });
            
            if(errorMessage){
                // console.log(event.target);

                var formGroup = getParent(event.target, '.form-group');
                if(formGroup)
                {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage){
                        formMessage.innerText = errorMessage;
                    }
                }
            }

            //underfined => khong loi
            return !errorMessage; //true => khong loi //false: co loi
            // console.log(errorMessage);
        }

        function handleClearError(event){
                var formGroup = getParent(event.target, '.form-group');
                if(formGroup.classList.contains('invalid'))
                {
                    formGroup.classList.remove('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage){
                        formMessage.innerText = '';
                    }
                }
        }

        //Xu ly hanh vi submit form
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isValid = true;
            var inputs = formElement.querySelectorAll("[name][rules]");
            for(var input of inputs)
            {
                var isInputValid = handleValidate({target: input});
                if(!isInputValid)
                {
                    isValid = false;
                }
            }
            if(isValid){
                if(typeof _this.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+ input.name +'"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) 
                                {
                                    values[input.name] = [];
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return  values;
                    }, {});
                    _this.onSubmit(formValues);
                }
                else{
                    formElement.submit();
                }
            }
        }

        // console.log(formRules);
    }
}