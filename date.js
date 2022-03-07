exports.day=()=>{
    var today=new Date();
    var options={
        weekday:"long",
    };
    return today.toLocaleDateString("en-US",options);
};

console.log(module.exports);