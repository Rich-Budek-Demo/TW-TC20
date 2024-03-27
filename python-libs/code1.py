"""
For launch pad
"""
import project_config
project_config.ProjectFile = project_config.Projects.LAUNCHPAD

import lights_tw
import time_tw
import pins_tw
import debug_tw



lights = lights_tw.new_light_strand(17,10)

def loop():
    # lights_tw.set_multiple_lights(lights,lights_tw.Color(255,0,255),1,3)
    
    red = lights_tw.Color(255,0,0)
    yellow = lights_tw.Color(255,251,0)
    black = lights_tw.Color(0,0,0)
    blue = lights_tw.Color(247,7,7)
    if pins_tw.digital_read(14):
        if pins_tw.digital_read(15):
            color_to_use = yellow
        else:
            color_to_use = red
        for i in range(5):
            lights_tw.set_light_color(lights, i, color_to_use)
            time_tw.delay(1000)
            lights_tw.set_light_color(lights, i, black)
            time_tw.delay(100)

    return
