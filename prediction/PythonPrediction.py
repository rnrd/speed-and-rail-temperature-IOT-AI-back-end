import sys
import json
import pandas as pd
import numpy as np 
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import  StandardScaler 
from sklearn.svm import SVR
from sklearn.metrics import r2_score


#writing a function to read all incoming data 
def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

#assign all data to a variable
data=read_in()

#in order to establish a pandas dataframe we need array
#create empty array for each feature
temperature=[]
month=[]
hour=[]
weatherTemperature=[]
weatherTemperatureFeel=[]
weatherTemperatureMin=[]
weatherTemperatureMax=[]
weatherHumidity=[]
weatherWindSpeed=[]
weatherWindDegree=[]
weatherType=[]

#last index of incoming data is sent by user of the web site
#remaining data is from MongoDB database
#we will assign database data to the empty arrays created above
for i in range(len(data)-1):
    temperature.append(data[i]["temperature"])
    month.append(data[i]["month"])
    hour.append(data[i]["hour"])
    weatherTemperature.append(data[i]["weatherTemperature"])
    weatherTemperatureFeel.append(data[i]["weatherTemperatureFeel"])
    weatherTemperatureMin.append(data[i]["weatherTemperatureMin"])
    weatherTemperatureMax.append(data[i]["weatherTemperatureMax"])
    weatherHumidity.append(data[i]["weatherHumidity"])
    weatherWindSpeed.append(data[i]["weatherWindSpeed"])
    weatherWindDegree.append(data[i]["weatherWindDegree"])
    weatherType.append(data[i]["weatherType"])

#in order to create a pandas dataframe we need to create a python dictionary
df={
    "temperature": temperature,
    "month": month,
    "hour": hour,
    "weatherTemperature": weatherTemperature,
    "weatherTemperatureFeel": weatherTemperatureFeel,
    "weatherTemperatureMin": weatherTemperatureMin,
    "weatherTemperatureMax": weatherTemperatureMax,
    "weatherHumidity": weatherHumidity,
    "weatherWindSpeed": weatherWindSpeed,
    "weatherWindDegree": weatherWindDegree,
    "weatherType": weatherType
}

#we will create another python dictionary for data coming from user of the web site
reqData={
    "month": data[-1]["month"],
    "hour": data[-1]["hour"],
    "weatherTemperature": data[-1]["weatherTemperature"],
    "weatherTemperatureFeel": data[-1]["weatherTemperatureFeel"],
    "weatherTemperatureMin": data[-1]["weatherTemperatureMin"],
    "weatherTemperatureMax": data[-1]["weatherTemperatureMax"],
    "weatherHumidity": data[-1]["weatherHumidity"],
    "weatherWindSpeed": data[-1]["weatherWindSpeed"],
    "weatherWindDegree": data[-1]["weatherWindDegree"],
    "weatherType": data[-1]["weatherType"]
}

#defining pandas dataframe
dataFrame=pd.DataFrame(df)

#dropping the target feature
input=dataFrame.drop(["temperature"], axis=1)

#defining the target feature
output=dataFrame["temperature"]

#in order to scale data coming from user of the website
#we will assign input variable to a new variable 
scaling=input

#adding data coming from user of the website in to input variable
scaling=scaling.append(reqData, ignore_index=True)

#shift string data of input and scaling variable into numbers 
input["weatherType"]=input["weatherType"].replace({"Clear":0, "Clouds":1, "Rain":2, "Mist":3, "Snow":4})
scaling["weatherType"]=scaling["weatherType"].replace({"Clear":0, "Clouds":1, "Rain":2, "Mist":3, "Snow":4})
input["month"]=input["month"].replace({"January":0, "February":1, "March":2, "April":3, "May":4, "June":5,
                                       "July":6, "August":7, "September":8, "October":9, "December":10, "November":11
                                    })
scaling["month"]=scaling["month"].replace({"January":0, "February":1, "March":2, "April":3, "May":4, "June":5,
                                       "July":6, "August":7, "September":8, "October":9, "December":10, "November":11
                                    })


#we will use standard scaling for scaling variable
input_scale=StandardScaler().fit_transform(scaling)

#we will assing the last index of input_scale, which is data from user of website, to variable
prediction_array=[input_scale[-1]]

#defining training and test data generated from the variable named input 
X_train, X_test, y_train, y_test= train_test_split(input, output, test_size=0.3, random_state=0)

#scaling train and test data of the variable named input
X_train=StandardScaler().fit_transform(X_train)
X_test=StandardScaler().fit_transform(X_test)

#defining support vector regression model
output_svr=SVR(kernel="rbf", C=120, gamma="scale", epsilon=0.1)

#fitting the model
output_svr.fit(X_train,y_train)
#prediction for X_test
pred= output_svr.predict(X_test)

#r2 score for X_test prediction
prediction_rate=r2_score(pred, y_test)

#prediction of data coming from user of the website
prediction=output_svr.predict(prediction_array)


#sending rounded prediction value to main thread
print(round(prediction[0],2))



sys.stdout.flush()