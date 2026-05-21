document.addEventListener("DOMContentLoaded", function() {
    let expenseListEl = document.getElementById("expenseList");
    // ... rest of your code here
    let inputformEl=document.getElementById("inputform");
    let salaryEl=document.getElementById("salary");
    let nameEl=document.getElementById("name");
    let amountEl=document.getElementById("amount");
    let salaryCardEl=document.getElementById("salaryCard");
    let totalExpenseCardEl=document.getElementById("totalExpenseCard");
    let balanceCardEl=document.getElementById("balanceCard");
    let nameErrMsgEl=document.getElementById("nameErrMsg");
    let salaryErrMsgEl=document.getElementById("salaryErrMsg");
    let amountErrMsgEl=document.getElementById("amountErrMsg");
    let expenseChartEl = document.getElementById("expenseChart");
    let warningMsgEl = document.getElementById("warningMsg");
    let downloadBtnEl = document.getElementById("downloadBtn");
    let usdBalanceEl = document.getElementById("usdBalance");
    let darkThemeEl=document.getElementById("darkTheme");
    let chart;
    let expenses=[];
    let salary=0;
    darkThemeEl.addEventListener("click", function(){
        document.body.classList.toggle("dark-mode");
        darkThemeEl.classList.toggle("fa-sun");
        darkThemeEl.classList.toggle("fa-moon");
        if(document.body.classList.contains("dark-mode")){
            localStorage.setItem("theme", "dark");
        }
        else{
            localStorage.setItem("theme", "light");
        }
    });
    async function convertCurrency(remainingBalance){
        let response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
        let data = await response.json();
        let usdRate = data.rates.USD;
        let usdBalance =remainingBalance * usdRate;
        usdBalanceEl.textContent =`USD Balance: $${usdBalance.toFixed(2)}`;
    }
    function renderChart(){
        if(chart){
            chart.destroy();
        }
        let totalExpenses = 0;
        for (let item of expenses){
            totalExpenses =totalExpenses + item.amount;
        }
        let remainingBalance = Math.max(salary - totalExpenses, 0);
        chart = new Chart(expenseChartEl, {
            type: "pie",
            data: {
                labels: ["Expenses","Remaining Balance"],
                datasets: [
                    {
                        data: [totalExpenses,remainingBalance],
                        backgroundColor: ["#ff6384","#36a2eb"],
                        borderWidth: 1
                    }
                ]
            }
        });
    }
    function renderExpenses(){
        expenseListEl.innerHTML = "";
        if(expenses.length === 0){
            let emptyMsg = document.createElement("p");
            emptyMsg.textContent ="No expenses added yet";
            emptyMsg.classList.add("empty-msg");
            expenseListEl.appendChild(emptyMsg);
            return;
        }
        for (let expense of expenses){
            let eachexpense=document.createElement("div");
            eachexpense.classList.add("each-item");
            let listname=document.createElement("p");
            eachexpense.appendChild(listname);
            listname.textContent=expense.name;
            listname.classList.add("expense-name");
            let listamount=document.createElement("p");
            eachexpense.appendChild(listamount);
            listamount.textContent=expense.amount;
            listamount.classList.add("expense-amount");
            let listdate=document.createElement("p");
            eachexpense.appendChild(listdate);
            listdate.textContent=expense.date;
            listdate.classList.add("expense-date");
            let deleteIcon = document.createElement("i");
            deleteIcon.setAttribute("data-id",expense.id);
            deleteIcon.classList.add(
                "fa-solid",
                "fa-trash"
            );
            deleteIcon.addEventListener("click", function(event){
                const deleteId = event.target.dataset.id;
                expenses = expenses.filter(function(eachExpense){
                    return eachExpense.id != deleteId;
                });
                localStorage.setItem("expenses",JSON.stringify(expenses));
                let totalExpenses = 0;
                for (let item of expenses){
                    totalExpenses = totalExpenses + item.amount;
                }
                const remainingBalance = salary - totalExpenses;
                convertCurrency(remainingBalance);
                let thresholdLimit = salary * 0.10;
                if (remainingBalance < thresholdLimit){
                    warningMsgEl.textContent = "⚠ Low Balance Alert!";
                    balanceCardEl.classList.add("low-balance");
                }
                else{
                    warningMsgEl.textContent = "";
                    balanceCardEl.classList.remove("low-balance");
                }
                totalExpenseCardEl.textContent = totalExpenses;
                balanceCardEl.textContent = remainingBalance;
                renderExpenses();
                renderChart();
            });
            eachexpense.appendChild(deleteIcon);
            expenseListEl.appendChild(eachexpense);

        }
    }
    inputformEl.addEventListener("submit",function(event){
        event.preventDefault();
        if (
            salaryEl.value === "" ||
            nameEl.value.trim() === "" ||
            amountEl.value === ""
        ) {
            alert("Please fill all fields");
            return;
        }
        const expenseName=nameEl.value;
        const expenseAmount=Number(amountEl.value);
        const todayDate=new Date();
        salary=Number(salaryEl.value);
        localStorage.setItem("salary",salary);
        const expense={
            id:Date.now(),
            name:expenseName,
            amount:expenseAmount,
            date:todayDate.toLocaleDateString()
        }
        expenses.push(expense);
        localStorage.setItem("expenses",JSON.stringify(expenses));
        let totalExpenses=0;
        for (let i of expenses){
            totalExpenses = totalExpenses + i.amount;
        }
        const remainingBalance=salary-totalExpenses;
        convertCurrency(remainingBalance);
        let thresholdLimit = salary * 0.10;
        if (remainingBalance < thresholdLimit){
            warningMsgEl.textContent = "⚠ Low Balance Alert!";
            balanceCardEl.classList.add("low-balance");
        }
        else{
            warningMsgEl.textContent = "";
            balanceCardEl.classList.remove("low-balance");
        }
        salaryCardEl.textContent=salary;
        totalExpenseCardEl.textContent=totalExpenses;
        balanceCardEl.textContent=remainingBalance;
        renderExpenses();
        renderChart();
        nameEl.value="";
        amountEl.value="";
    })
    nameEl.addEventListener("blur", function(event) {
    if (event.target.value === "") {
        nameErrMsgEl.textContent = "Required*";
    } else {
        nameErrMsgEl.textContent = "";
    }
    })
    salaryEl.addEventListener("blur", function(event) {
    if (event.target.value === "") {
        salaryErrMsgEl.textContent = "Required*";
    } else {
        salaryErrMsgEl.textContent = "";
        salary = Number(event.target.value); // ✅ update salary here
        salaryCardEl.textContent = salary;
    }
    })
    amountEl.addEventListener("blur", function(event) {
    if (event.target.value === "") {
        amountErrMsgEl.textContent = "Required*";
    } else {
        amountErrMsgEl.textContent = "";
    }
    })
    function initializeData(){
        let storedExpenses =localStorage.getItem("expenses");
        let savedTheme = localStorage.getItem("theme");
        if(savedTheme === "dark"){
            document.body.classList.add("dark-mode");
            darkThemeEl.classList.remove("fa-moon");
            darkThemeEl.classList.add("fa-sun");
        }
        if (storedExpenses !== null){
            expenses = JSON.parse(storedExpenses);
        }
        let storedSalary = localStorage.getItem("salary");
        if (storedSalary !== null){
            salary = Number(storedSalary);
            salaryEl.value = salary;
        }
        salaryCardEl.textContent = salary;
        let totalExpenses = 0;
        for (let item of expenses){
            totalExpenses =totalExpenses + item.amount;
        }
        let remainingBalance =salary - totalExpenses;
        convertCurrency(remainingBalance);
        totalExpenseCardEl.textContent =totalExpenses;
        balanceCardEl.textContent =remainingBalance;
        renderExpenses();
        renderChart();
    }
    initializeData();
    downloadBtnEl.addEventListener("click", function(){
        const doc = new jspdf.jsPDF();
        // TITLE
        doc.setFontSize(20);
        doc.setTextColor(0, 102, 204);
        doc.text("Cash Flow Report", 20, 20);
        // SUMMARY SECTION
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`Total Salary: Rs. ${salary}`, 20, 40);
        doc.text(`Total Expenses: Rs. ${totalExpenseCardEl.textContent}`,20,50);
        doc.text(`Remaining Balance: Rs. ${balanceCardEl.textContent}`,20,60);
        // HEADING
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204);
        doc.text("Expense List", 20, 80);
        // LINE
        doc.setTextColor(0, 0, 0);
        doc.line(20, 85, 190, 85);
        // TABLE HEADERS
        doc.setFontSize(12);
        doc.text("Name", 20, 95);
        doc.text("Amount", 90, 95);
        doc.text("Date", 150, 95);
        // HEADER LINE
        doc.line(20, 100, 190, 100);
        // START POSITION
        let y = 115;
        // LOOP THROUGH EXPENSES
        for (let expense of expenses){
            doc.text(expense.name, 20, y);
            doc.text(`Rs. ${expense.amount}`, 90, y);
            doc.text(expense.date, 150, y);
            y = y + 10;
        }
        // DOWNLOAD PDF
        doc.save("cash-flow-report.pdf");
    });
});

