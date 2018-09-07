const robot = require("robotjs")
const exit = require('exit')
const commandLineUsage = require('command-line-usage')
const debounceWrapper = require('debounce')
const ms = require('milliseconds')
const ioHook = require('iohook')
const moment = require('moment')
const comLines = require('command-line-args')
const {seconds, minutes} = ms
const milliseconds = val=>val

const optionDefs = [
  {
    name:'interval', alias: 'i', 
    type: Number, defaultValue: 30, 
    typeLabel: '{underline <seconds>}',
    description: 'The number of seconds to wait between cursor movements. [default is 30 seconds]'
  },
  {
    name:'timeout', alias: 't', 
    type: Number, defaultValue: 3,
    typeLabel: '{underline <minutes>}',
    description: 'The number of minutes to wait after user input before moving cursor. [default is 3 minutes]'
  },
  {
    name:'debounce', alias: 'd', 
    type: Number, defaultValue: 1,
    typeLabel: '{underline <seconds>}',
    description: 'The number of seconds after user input to suspend input detection. [default is 1 second]'
  },
  {
    name:'quiet', alias:'q', 
    type: Boolean, 
    defaultValue: false,
    description: 'Silence Output'
  },
  {
    name:'help', alias: 'h', 
    type: Boolean, defaultValue: false,
    description: 'Print out helpful usage information.'
  }
]
const sections = [
  {
    header: 'NoSleep App',
    content: 'Simple Node.JS app to keep a pc from sleeping.'
  },
  {
    header: 'Options',
    optionList: optionDefs
  }
]

const usage = commandLineUsage(sections)
const {interval, timeout, debounce, quiet, help} = comLines(optionDefs)
const log = !quiet

let timers = {
  interval: seconds(interval), 
  timeout: minutes(timeout),
  debounce: seconds(debounce)
}

let count = 0
let operator = [-1,1]
let direction = ['left', 'right']
let ids = {interval:0, timeout:0}

let lastMouse = {x:0,y:0}

function NoSleep (){
  count += 1
  // get mouse position
  let mouse = robot.getMousePos();
  let {x,y} = mouse
  // if even it will subtract 1 pixel if odd it will add 1 pixel
  x += operator[count%2]
  y -= 1 //there's creep on the y axis so subtract 1
  // move mouse accordingly 
  ioHook.stop()
  robot.moveMouse(x,y) 
  setTimeout(()=>ioHook.start(),100)
  logger(`Run ${count}: moved mouse to ${direction[count%2]}`)
}
function logger (text) {
  if (log) console.log(`${moment().format()}> ${text}`)
}

let onHook = debounceWrapper(event =>{
  clearInterval(ids.interval)
  clearTimeout(ids.timeout)
  logger(`${event.type}: Restarting timeout timer (${timers.timeout}ms)`)
  ids.timeout = setTimeout(function (event){
    clearTimeout(ids.timeout)
    clearInterval(ids.interval)
    logger(`${event.type}: Restarting interval timer (${timers.interval}ms)`)
    NoSleep()
    ids.interval = setInterval(NoSleep,timers.interval)
  },timers.timeout, event)
}, timers.debounce, true)

if (help) {
  console.log(usage)
  exit(0)
} else {

  let listeners = {
    on: ()=>{
      ioHook.on('mousemove', onHook)
      ioHook.on('keyup', onHook)
    }
  }

  listeners.on()

  logger(`NoSleep Started, Waiting for first run`)
  ioHook.start()
  onHook({type: "appStart"})

}