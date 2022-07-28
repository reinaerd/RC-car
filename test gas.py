import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BOARD)

m1a = 23
m2a = 21
m3a = 19

GPIO.setup(m1a,GPIO.OUT)
GPIO.setup(m2a,GPIO.OUT)
GPIO.setup(m3a,GPIO.OUT)


print("Forward")
GPIO.output(m1a,GPIO.HIGH)
GPIO.output(m2a,GPIO.LOW)
GPIO.output(m3a,GPIO.HIGH)

sleep(4)

print("BAckward")
GPIO.output(m2a,GPIO.HIGH)
GPIO.output(m3a,GPIO.LOW)

sleep(4)

print ("STOP")
GPIO.output(m3a,GPIO.LOW)
GPIO.cleanup()
