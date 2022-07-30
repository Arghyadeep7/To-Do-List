const express=require("express");
const app=express();
const mongoose=require("mongoose");

require('dotenv').config();

async function main(){
    mongoose.connect(`mongodb+srv://${process.env.MONGODB_URL}.mongodb.net/itemsDb`,{useNewUrlParser:true});
}

main().catch(err=>console.log(err));

const defaultSchema = new mongoose.Schema({
    name:String,
});

const Item = mongoose.model("Item",defaultSchema);

const item1 = new Item({
    name: "Press + sign to add a new item to your list!"
});

const item2 =  new Item({
    name: "<= Check this to remove an item from your list!"
});

const defaultItems = [item1, item2];

const listSchema = new mongoose.Schema({
    title: String,
    items: [defaultSchema]
});

const List = mongoose.model("List",listSchema);

app.listen(process.env.PORT || 3000,function(){
    console.log("Listening on port 3000.....");
});

app.use(express.urlencoded({extended:true}));

app.use(express.static("Static"));

app.set("view engine", "ejs");

app.get("/", function(req,res){
    Item.find({},function(err,foundItems){
        if(err){
            console.log(err);
        }else{
            if(foundItems.length == 0){
                Item.insertMany(defaultItems,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Successfully saved the default items!");
                    }
                });
                res.redirect("/");
            }else{
                res.render("index",{title:"Today",items:foundItems});
            }
        }
    });
});

app.post("/",function(req,res){
    let newItem=req.body.tinput;
    let listName=req.body.button;

    const item= new Item({
        name: newItem
    });

    if(req.body.button==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({title:listName},function(err,foundItem){
            if(err){
                console.log(err);
            }else{
                console.log(foundItem);
                foundItem.items.push(item);
                foundItem.save();
                res.redirect("/"+foundItem.title);
            }
        });
    }
});

app.post("/delete",function(req,res){
    let listName=req.body.listName;
    let itemName=req.body.itemName;
    if(listName==="Today"){
        Item.findOneAndDelete({name:itemName},function(err,foundItem){
            if(err){
                console.log(err);
            }else{
                console.log("Deleted item: ",foundItem);
            }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({title:listName},{$pull: {items: {name: itemName}}},function(err,foundItem){
            if(err){
                console.log(err);
            }else{
                console.log("Deleted item: ",foundItem);
            }
            res.redirect("/"+listName);
        });
    }
});

app.get("*", function(req,res){
    
    res.render("error",{title:"Error"});
    
});
