const mongoose=require("mongoose");
const Schema=mongoose.Schema;

//we need to establish our data model and define the data for mongoDB.
//we will cerate a mongoDB schema.
const systemParameters=new Schema({
    stop: {
        type: Boolean,
        required: true
    },
    start: {
        type: Boolean,
        required: true
    },
    direction : {
        type: Boolean,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    temperatureValidation: {
        type: Number,
        required: true
    },
    speed: {
        type: Number,
        required: true
    },
    counter_1: {
        type: Number,
        required: true
    },
    counter_2: {
        type: Number,
        required: true
    },

    weatherTemperature:{
        type: Number,
        required: true
    },

    weatherTemperatureFeel:{
        type: Number,
        required: true
    },

    weatherTemperatureMin:{
        type: Number,
        required: true
    },

    weatherTemperatureMax:{
        type: Number,
        required: true
    },

    weatherHumidity:{
        type: Number,
        required: true
    },

    weatherWindSpeed:{
        type: Number,
        required: true
    },

    weatherWindDegree:{
        type: Number,
        required: true
    },
    
    weatherType:{
        type: String,
        required: true
    }


})

//now we will create a model with mongoose.model function.
//we will give "Parameter" as the name of model and pass our schema above in this function.
module.exports=mongoose.model("Parameter",systemParameters)