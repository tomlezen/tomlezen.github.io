var Clock = (function() {
        
    // private variables
    var canvas, // canvas element
        ctx, // canvas context
        bgGrad = true, // background gradient flag
        gradient, // gradient (background)
        height = 80, // canvas height
        key = {up: false, shift: false}, // key presses
        particles = [], // particle array
        particleColor = 'hsla(0, 0%, 100%, 0.3)', // particle color
        mouse = {x: 0, y: 0}, // position of mouse / touch
        press = false, // pressed flag
        quiver = false, // quiver flag
        text, // the text to copy pixels from
        textSize = 20, // (initial) textsize
        valentine = false, // valentine-ify it for a bit?
        msgTime = 100, // time to show a message before returning to clock
        updateColor = true, // update color of gradient / particles with time?
        width = 200; // canvas width
    
    // Constants
    var FRAME_RATE = 20, // frames per second target
        MIN_WIDTH = 200, // minimum width of canvas
        MIN_HEIGHT = 60, // minimum height of canvas
        PARTICLE_NUM = 600, // (max) number of particles to generate
        RADIUS = Math.PI * 2; // radius of particle
    
    var defaultStyles = function() {
        textSize = 40;
        // particle color
        particleColor = 'rgb(202, 235, 216)'; 
    };
    
    var draw = function(p) {
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, RADIUS, true);
        ctx.closePath();
        ctx.fill();
    };
    

    var getTime = function(amPM) {
        var date = new Date(),
            hours = date.getHours(),
            timeOfDay = '';

        if(amPM) {
            hours = ( hours > 12 ) ? hours -= 12 : hours;
            hours = ( hours == 0 ) ? 12 : hours;
        } else {
            hours = pad(hours);
        }

        var minutes = pad(date.getMinutes());
        var seconds = pad(date.getSeconds());
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            timeString: hours + " : " + minutes + " : " + seconds
        };
    };

    // animation loop
    var loop = function() {
      
        // clear out text
        ctx.clearRect(0, 0, width, height);

        var time = getTime(true);

        defaultStyles();
        text = time.timeString;
      
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.textBaseline = "middle";
        ctx.font = textSize + "px 'Avenir', 'Helvetica Neue', 'Arial', 'sans-serif'";
        ctx.fillText(text, (width - ctx.measureText(text).width) * 0.5, height * 0.5 + 10);

        // copy pixels
        var imgData = ctx.getImageData(0, 0, width, height);
      
        // clear canvas, again
        ctx.clearRect(0, 0, width, height);


        for(var i = 0, l = particles.length; i < l; i++) {
                var p = particles[i];
                p.inText = false;
        }
        particleText(imgData);
    };

    var pad = function(number) {
        return ('0' + number).substr(-2);
    };

    var particleText = function(imgData) {

        var pxls = [];
        for(var w = width; w > 0; w-=3) {
            for(var h = 0; h < width; h+=3) {
                var index = (w+h*(width))*4;
                if(imgData.data[index] > 10) {
                    pxls.push([w, h]);
                }
            }
        }

        var count = pxls.length;
        for(var i = 0; i < pxls.length && i < particles.length; i++) {
            try {
                var p = particles[i], 
                    X, 
                    Y;
                
                if(quiver) {
                    X = (pxls[count-1][0]) - (p.px + Math.random() * 5);
                    Y = (pxls[count-1][1]) - (p.py + Math.random() * 5);
                } else {
                    X = (pxls[count-1][0]) - p.px;
                    Y = (pxls[count-1][1]) - p.py;
                }
          
                // tangent
                var T = Math.sqrt(X*X + Y*Y);

                // arctangent
                var A = Math.atan2(Y, X);
              
                // cosine
                var C = Math.cos(A);
              
                // sine
                var S = Math.sin(A);
              
                // set new postition
                p.x = p.px + C * T * p.delta;
                p.y = p.py + S * T * p.delta;
              
                // set previous positions
                p.px = p.x;
                p.py = p.y;
          
                p.inText = true;
          
                // draw the particle
                draw(p);
          
                if(key.up === true) {
                    p.size += 0.3;
                } else {
                    var newSize = p.size - 0.5;
                    if(newSize > p.origSize && newSize > 0) {
                        p.size = newSize;
                    } else {
                        p.size = m.origSize;
                    }
                }
            } catch(e) {
                //console.log(e);
            }
            count--;
        }
    };

    // set dimensions of canvas
    var setDimensions = function () {
        width = 200;
        height = 50;

        // Resize the canvas
        canvas.width = width;
        canvas.height = height;
    };

    /** 
     * Public Methods
     */
    return {

        init: function(canvasID) {
        
            canvas = document.getElementById(canvasID);
            // make sure canvas exists and that the browser understands it
            if(canvas === null || !canvas.getContext) {
                return;
            }
            // set context
            ctx = canvas.getContext("2d");
      
            // set dimensions
            setDimensions();
        
            // ui
            this.ui();
        
            for(var i = 0; i < PARTICLE_NUM; i++) {
                particles[i] = new Particle(canvas);
            }   
        
            // set defaults
            defaultStyles();
        
            // let's do this
            setInterval(loop, FRAME_RATE);
        
        },
      
        ui: function() {        
            window.addEventListener('resize', function(e){
                setDimensions();
            }, false);
        
        }
      
    };
    
  })();
  
  // Create new particles
  var Particle = function(canvas) {
  
        var range = Math.random() * 180 / Math.PI, // random starting point
            spread = canvas.height, // how far away from text should the particles begin?
            size = Math.random() * 2 + 1; // random size of particle
    
        this.delta = 0.25;
        this.x = 0;
        this.y = 0;
    
        // starting positions
        this.px = (canvas.width / 2) + (Math.cos(range) * spread);
        this.py = (canvas.height / 2) + (Math.sin(range) * spread);
    
        this.velocityX = Math.floor(Math.random() * 5) - 5;
        this.velocityY = Math.floor(Math.random() * 5) - 5;
    
        this.size  = size;
        this.origSize = size;
    
        this.inText = false;
    
  };
  

Clock.init('clock_canvas');