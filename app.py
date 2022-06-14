import cv2
import sys
import json
import RPi.GPIO as GPIO
from flask import Flask, render_template, Response, request, jsonify, make_response, send_from_directory
from webcamvideostream import WebcamVideoStream
from flask_basicauth import BasicAuth
import time
from time import sleep
import threading

app = Flask(__name__)
app.config['BASIC_AUTH_USERNAME'] = 'pi'
app.config['BASIC_AUTH_PASSWORD'] = 'raspberry'
app.config['BASIC_AUTH_FORCE'] = True

basic_auth = BasicAuth(app)
last_epoch = 0


def backwards():    
    GPIO.setmode(GPIO.BOARD)

    m1a = 23
    m2a = 21
    m3a = 19

    GPIO.setup(m1a,GPIO.OUT)
    GPIO.setup(m2a,GPIO.OUT)
    GPIO.setup(m3a,GPIO.OUT)

    GPIO.output(m1a, GPIO.HIGH)
    GPIO.output(m2a, GPIO.LOW)
    GPIO.output(m3a, GPIO.HIGH)

    sleep(5)
    stop()


def forward():
    GPIO.setmode(GPIO.BOARD)

    m1a = 23
    m2a = 21
    m3a = 19

    GPIO.setup(m1a,GPIO.OUT)
    GPIO.setup(m2a,GPIO.OUT)
    GPIO.setup(m3a,GPIO.OUT)

    GPIO.output(m1a, GPIO.HIGH)
    GPIO.output(m2a, GPIO.HIGH)
    GPIO.output(m3a, GPIO.LOW)


def left():
    GPIO.setmode(GPIO.BOARD)

    m1 = 16
    m2 = 18
    m3 = 22

    GPIO.setup(m1,GPIO.OUT)
    GPIO.setup(m2,GPIO.OUT)
    GPIO.setup(m3,GPIO.OUT)

    GPIO.output(m1, GPIO.HIGH)
    GPIO.output(m2, GPIO.HIGH)
    GPIO.output(m3, GPIO.LOW)

    sleep(5)
    straight()


def straight():
    GPIO.setmode(GPIO.BOARD)

    m3 = 22

    GPIO.setup(m3,GPIO.OUT)

    GPIO.output(m3,GPIO.LOW)
    
def right():
    GPIO.setmode(GPIO.BOARD)

    m1 = 16
    m2 = 18
    m3 = 22

    GPIO.setup(m1,GPIO.OUT)
    GPIO.setup(m2,GPIO.OUT)
    GPIO.setup(m3,GPIO.OUT)

    GPIO.output(m1,GPIO.HIGH)
    GPIO.output(m2,GPIO.LOW)
    GPIO.output(m3,GPIO.HIGH)

    sleep(5)
    straight()


def stop():
    GPIO.setmode(GPIO.BOARD)
    m3a = 19
    GPIO.setup(m3a,GPIO.OUT)
    GPIO.output(m3a,GPIO.LOW)
    GPIO.cleanup()


stop()




#Flask

@app.route('/')
def index():
    return render_template('index.html')

def gen(camera):
    while True:
        if camera.stopped:
            break
        frame = camera.read()
        ret, jpeg = cv2.imencode('.jpg',frame)
        if jpeg is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n\r\n')
        else:
            print("frame is none")

@app.route('/video_feed')
def video_feed():
    return Response(gen(WebcamVideoStream().start()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route("/direction", methods=["POST"])
def postME():
    json_data = request.json

    try:
        if (json_data["direction"] == "forward"):
            forward()
        elif (json_data["direction"] == "backwards"):
            backwards()
        elif (json_data["direction"] == "left"):
            left()
        elif (json_data["direction"] == "right"):
            right()
        elif (json_data["direction"] == "straight"):
            straight()
        else:
            stop()
    except Exception:
        raise Exception("Internal problem")
    
    return json_data 


@app.route('/sw.js')
def sw():
    response=make_response(
                     send_from_directory('static',filename='sw.js'))
    response.headers['Content-Type'] = 'application/javascript'
    return response

@app.route("/apple-touch-icon.png")
def appleLoader():
    response=make_response(
                     send_from_directory('static/icons',filename='apple-touch-icon.png'))
    response.headers['Content-Type'] = 'image/png'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=8080, host='192.168.1.44')