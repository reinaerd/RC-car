import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BOARD)

m1 = 16
m2 = 18
m3 = 22



GPIO.setup(m1,GPIO.OUT)
GPIO.setup(m2,GPIO.OUT)
GPIO.setup(m3,GPIO.OUT)




print("Right")
GPIO.output(m1,GPIO.HIGH)
GPIO.output(m2,GPIO.LOW)
GPIO.output(m3,GPIO.HIGH)



sleep(4)

print("Left")
GPIO.output(m2,GPIO.HIGH)
GPIO.output(m3,GPIO.LOW)



sleep(4)

print ("STOP")
GPIO.output(m3,GPIO.LOW)

GPIO.cleanup()
