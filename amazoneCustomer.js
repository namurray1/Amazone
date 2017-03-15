// npm packages (mysql, inquirer, and cli-table)
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

// Create connection to mysql server 
var connection = mysql.createConnection ({

    host: "localhost",
    port: 3306,

    user: "root",
    password: "root",
    database: "amazone_db"

});

// Establish connection to the database
connection.connect(function(error){

    if (error) throw error;
    // Upon successful connection, run the main function
    shop();

}); // Connect callback function end

// Main function
function shop () {

    // Print item ID, product name/description, department, price, and stock quantity
    connection.query("SELECT * FROM products", function(error, results){
        
        if (error) throw error;

        // Table printed to screen
        var table = new Table({

            head: [ "ID", "Product", "Department", "Price ($)", "Qty"],
            colWidths: [10, 50, 25, 30, 10]
        
        }); 
        
        // Loop through database information
        for (var i = 0; i < results.length; i++){

            // Push database information to create table
            table.push(

                [
                results[i].item_id,
                results[i].product_name,
                results[i].department_name,
                results[i].price,
                results[i].stock_quantity
                ]

            ); //Table push ends here

        } // for loop ends here

        // Print out the table on the screen
        console.log(table.toString());

        // Prompt user for input with two questions
        inquirer.prompt([

            {
                type: "input",
                name: "productID",
                message: "Hello! Please enter the ID for the product you would like to buy: "
            },

            {
                type: "input",
                name: "quantityReqd",
                message: "OK! Now, all you have to do is tell us how many you would like to purchase: "
            }

        // inquirer prompt ends here, and callback function begins  
        ]).then(function(userInput){

            // typecast user input to an integer
            var toSell = parseInt(userInput.productID.trim());
            var qtyToSell = parseInt(userInput.quantityReqd.trim());

            // User input passed to sale function.
            sale(toSell, qtyToSell);

        }); // Inquirer callback ends here.

    }); // Query callback function ends here;

} // Shop function ends here

// ==================================================================================

//sale function takes user input and runs the number through database, and determines
//if the store has quantity of product in inventory as specified by the user.

function sale(item, quantity) {

    // Pull the item specified by the user, from the database.
    connection.query ("SELECT * FROM products WHERE ?", 
    { item_id : item }, function(err, res){

        if (err) throw err;

        // Compare the specified quantity to the number of items in inventory. If the quantity is
        // greater than the user specified quantity
        if (res[0].stock_quantity >= quantity) {

            // Subtract the specified quantity from the stock
            newQuantity = res[0].stock_quantity - quantity;
            var totalPrice = (res[0].price * quantity).toFixed(2);

            // update the database with new quantity
            connection.query ("UPDATE products SET ? WHERE ?", 
            [
                { stock_quantity : newQuantity},
                { item_id: item }
            ], function (err, res){

                if (err) throw err;

                else {

                    // Print the total price for the user
                    console.log ("The grand total will be $" + totalPrice + "." +  " Thank you for shopping at Amazone!");
                    
                
                    process.exit();
                }

            }); // Callback for Update query ends here

        }

        else {

            // Inform the user that there is not enough of the item in stock to fulfill the order
            console.log("Sorry! We don't have enough quantity");
            process.exit();

        } 
     }); // Initial query for the item ends here

} // Sale function ends here.
