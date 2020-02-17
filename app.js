let BudgetController = (function(){
    let Expense = function(id,description,value){
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else
            this.percentage = -1;
    }
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    let Income = function(id,description,value){
        this.id = id,
        this.description = description,
        this.value = value
    }
    let data = {
        allItems:{
            inc: [],
            exp: []
        },
        total:{
            inc:0,
            exp:0
        },
        budget: 0,
        percentage: -1
    };
    calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });
        data.total[type] = sum;
    }
  
    return {
        addItem: function(type,des,value){
            let newItem;
            let ID = 0;
            if(data.allItems[type].length > 0) 
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            if(type === 'inc'){
                newItem = new Income(ID,des,value);
            }else{
                newItem = new Expense(ID,des,value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        testData: function(){
            console.log(data);
        },
        calculateBudget: function(){
            // Calculate total income
            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.total.inc - data.total.exp;
            // calculate the percentange
            if(data.total.inc > 0)
                data.percentage = Math.round((data.total.exp/data.total.inc) * 100);
            else
                data.percentage = -1;
        },
        getBudget: function(){
            return{
                totalIncome: data.total.inc,
                totalExpense: data.total.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },
        deleteItem: function(type,id){
             let ids;
             ids = data.allItems[type].map(function(curr){
                 return curr.id;
             });
             let idIndex = ids.indexOf(ids,id);
             data.allItems[type].splice(idIndex,1);
        },
        calculatePercentages: function(){
             data.allItems.exp.forEach(function(curr){
                 curr.calcPercentage(data.total.inc);
             });
        },
        getPercentages: function(){
            let allPercentages = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPercentages;
        }
    }

})();

let UIController = (function(){
        let DOMString = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputButton: '.add__btn',
            expenseSelect: '.expenses__list',
            incomeSelect: '.income__list',
            budgetSelect: '.budget__value',
            budgetIncomeSelect: '.budget__income--value',
            budgetExpenseSelect: '.budget__expenses--value',
            budgetExpensePercentage: '.budget__expenses--percentage',
            domContainer: '.container',
            percentageSelector : '.item__percentage',
            budgetMonth: '.budget__title--month'
        };
        return {
            getInput: function(){
                return{
                    type: document.querySelector(DOMString.inputType).value,
                    des: document.querySelector(DOMString.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMString.inputValue).value)
                }
            },
            getDOMString: function(){
                return DOMString;
            },
            addListItemtoUI: function(obj,type){
                let html,newHtml;
                if(type == 'inc'){
                    html = '<div class="item clearfix" id="inc-%id%">';
                    html+=    '<div class="item__description">%description%</div>';
                    html+=            '<div class="right clearfix">';
                    html+=                '<div class="item__value">+ %value%</div>';
                    html+=                '<div class="item__delete">';
                    html+=                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
                    html+=            '</div>';
                    html+=        '</div>';
                    html+=    '</div>';
                }else{
                    html =  '<div class="item clearfix" id="exp-%id%">';
                    html += '<div class="item__description">%description%</div>';
                    html += '<div class="right clearfix">';
                    html +=  '<div class="item__value">- %value%</div>';
                    html +=  '<div class="item__percentage">21%</div>';
                    html +=   '<div class="item__delete">';
                    html +=    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
                    html +=    '</div>';
                    html += '</div>';
                    html += '</div>';
                }
                newHtml = html.replace('%id%',obj.id);
                newHtml = newHtml.replace('%description%',obj.description);
                newHtml = newHtml.replace('%value%',obj.value);
                if(type === 'inc')
                    document.querySelector('.income__list').insertAdjacentHTML('beforeend',newHtml);
                else
                    document.querySelector(DOMString.expenseSelect).insertAdjacentHTML('beforeend',newHtml);
            },
            clearFields: function(){
                 let fields = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);
                 let fieldArray = Array.prototype.slice.call(fields);
                 fieldArray.forEach(function(curr, index, array){
                        curr.value = "";
                 });
            },
            displayBudget: function(obj){
                document.querySelector(DOMString.budgetSelect).textContent = obj.budget;
                document.querySelector(DOMString.budgetIncomeSelect).textContent = obj.totalIncome;
                document.querySelector(DOMString.budgetExpenseSelect).textContent = obj.totalExpense;
                if(obj.percentage > 0)
                    document.querySelector(DOMString.budgetExpensePercentage).textContent = obj.percentage +'%';
                else
                    document.querySelector(DOMString.budgetExpensePercentage).textContent = '---';
            },
            deleteFromUI: function(idSelect){
                //console.log(idSelect);
                let element  = document.getElementById(idSelect);
                element.parentNode.removeChild(element);
            },
            displayPercentage: function(percentages){
                let fields = document.querySelectorAll(DOMString.percentageSelector);
                let nodeListForList = function(list,callback){
                    for(let i = 0; i < list.length; i++){
                        callback(list[i],percentages[i])
                    }
                }
                nodeListForList(fields,function(curr, percentageValue){
                     if(percentageValue > 0)
                        curr.textContent = percentageValue  + '%';
                     else
                        curr.textContent = '---';
                });
            },
            displayMonths: function(){
                let today = new Date();
                let monthNo = today.getMonth();
                let year  = today.getFullYear();
                let months = ["January","February","March","April","May","June","July","August","September","November","December"];
                document.querySelector(DOMString.budgetMonth).textContent = months[monthNo] + ' ' + year;
            }
        }
})();

let Controller = (function(BudgetCntrl,UICntrl){
    let setupEventListener = function(){
        let DOMString = UICntrl.getDOMString();
        document.querySelector(DOMString.inputButton).addEventListener('click',cntrlAddItem);
        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13 || event.keyCode === 13){
                cntrlAddItem();
            }
        });
        document.querySelector(DOMString.domContainer).addEventListener('click',cntrlDeleteItem);
    }
    let updatePercentages = function(){
        // Calculate percentages
        BudgetCntrl.calculatePercentages();
        // read percentages from budget controller
        let percentages = BudgetCntrl.getPercentages() ;
        // Update the UI with new percentages
        UICntrl.displayPercentage(percentages);

    }
    let cntrlDeleteItem = function(event){
         let itemId;
         itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
         if(itemId){
             let item = itemId.split('-');
             let type = item[0];
             let id = item[1];
             // delete the item from data structure
             BudgetCntrl.deleteItem(type,id);
             // delete the item from ui
             UICntrl.deleteFromUI(itemId);
             // update and show the new budget
             updateBudget();
             // update percentages
             updatePercentages();
         }
    }
    let updateBudget = function(){
            // 4. Calculate the budget
            BudgetCntrl.calculateBudget();
            // return the budget
            let budget = BudgetCntrl.getBudget();
            // 5. display the budget on the UI
            UICntrl.displayBudget(budget);
    }
    let cntrlAddItem = function(){
        // 1. Get the field input data
        let input = UICntrl.getInput()
        if(input.description !== ""  && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            let item = BudgetCntrl.addItem(input.type,input.des,input.value);
            // 3. Add the item to the UI
            UICntrl.addListItemtoUI(item,input.type);
            // 4. Clear the fields
            UICntrl.clearFields();
            updateBudget();
            // update percentage
            updatePercentages();
        }
    }
    return {
        init: function(){
            setupEventListener();
            UICntrl.displayBudget({
                budget: 0,
                totalIncome:0,
                totalExpense:0,
                percentage:-1
            });
            UICntrl.displayMonths();
        }
    }
})(BudgetController,UIController);

Controller.init();