function Mandelbrot(canvasId, maxIteractions, transX, transY, zoomLevel, timing, animate, drawGrid) {
	
	this.canvas = document.getElementById(canvasId);
	
	this.zoomFactor = Math.pow(2, zoomLevel);
	this.zoomLevel = zoomLevel;
	this.transX = transX;
	this.transY = transY;
	this.timing = timing;
	this.drawGrid = drawGrid;
	
	this.maxIteractions = maxIteractions;
	this.animate = animate;
	this.isReady = true;
	
	if (!this.canvas.getContext)
		return;
	this.context = this.canvas.getContext('2d');
	this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	
	
	//Mandelbrot function
	this.belongToSet = function(x0, y0, iteractions){
		var iteraction = 0;
		var x = 0;
		var y = 0;
		while ((x * x + y * y <= 4) && (iteraction++ < iteractions)) {
			var xtemp = x * x - y * y + x0;
			y = 2 * x * y + y0;
			x = xtemp;
		}
		if(iteraction>=iteractions){
			return true;
		}
		
		return iteraction; 
	};
	
	
	if(this.animate){
		this.generate(0);
	}
	else{
		this.noAnimateGenerate();
	}
	
	this.moving = false;
	
	//Mouse listeners
	var that = this;
	
	this.zoomHandler = function(e){
		e.stopPropagation();
		e.preventDefault();
		if(!that.isReady) return;
		
		if(e.wheelDelta > 0){
			that.zoomLevel--;
			console.log("zoom out");
		}
		else{
			that.zoomLevel++;
			console.log("zoom in");
		}
		
		
		that.zoomFactor = Math.pow(2, that.zoomLevel);
		console.log(that.zoomFactor);
		
		//var mi = 50 / that.zoomFactor;
		
		//console.log("Max iteractions:" + mi);
		//that.maxIteractions = mi;
		if(that.animate){
			that.generate(0);
		}
		else{
			that.noAnimateGenerate();
		}
		
	};
	
	
	
	this.mouseDownHandler = function(e){
		console.log("mouse pressed");
		if(!that.moving){
			that.moving = true;
			that.movingFromX = e.layerX;
			that.movingFromY = e.layerY;
			console.log("x:"+e.layerX+" y:"+e.layerY);
		}
	}
	
	this.mouseMovedHandler = function(e){
		if(that.moving){
			console.log("Moving fractal");
		}
	}
	
	this.mouseUpHandler = function(e){
		if(that.moving){
			that.moving = false;
			console.log("stop moving");
			var dpx = Math.sqrt(Math.pow(e.layerX - that.movingFromX,2) + Math.pow(e.layerY - that.movingFromY,2));
			console.log(dpx);
		}
		
	}
	
	this.clickHandler = function(e){	
		if(!that.isReady) return;
		var px = e.layerX;
		var py = e.layerY;
		console.log("px:"+e.layerX+" py:"+e.layerY);
		var coords = that.pixelToCoords(px, py);
		console.log("x:"+coords[0]+" y:"+coords[1]);
		
		that.transX = coords[0];
		that.transY = coords[1];
		
		if(that.animate){
			that.generate(0);
		}
		else{
			that.noAnimateGenerate();
		}
	}
	
	
	window.onkeypress = function(e){
		if(that.isReady){
			switch(e.keyCode){
			case 43:{/*+*/
				that.maxIteractions = that.maxIteractions + 200;
				if(that.animate){
					that.generate(0);
				}
				else{
					that.noAnimateGenerate();
				}
				break;
			}
			case 45:{/*-*/
				that.maxIteractions = Math.max(that.maxIteractions - 200, 0);
				if(that.animate){
					that.generate(0);
				}
				else{
					that.noAnimateGenerate();
				}
				break;
			}
			case 115:{/*s*/
				console.log(that.canvas.toDataURL("image/png"));
				window.open(that.canvas.toDataURL("image/png"));
				break;
			}
			}
		}
	};
	
	if (this.canvas.addEventListener) {
		// IE9, Chrome, Safari, Opera
		this.canvas.addEventListener("mousewheel", this.zoomHandler, false);
		//this.canvas.addEventListener("mousemove", this.mouseMovedHandler, false);
		//this.canvas.addEventListener("mouseup", this.mouseUpHandler, false);
		//this.canvas.addEventListener("mouseout", this.mouseUpHandler, false);
		//this.canvas.addEventListener("mousedown", this.mouseDownHandler, false);
		this.canvas.addEventListener("click", this.clickHandler, false);
		
		// Firefox
		this.canvas.addEventListener("DOMMouseScroll", this.zoomHandler, false);
	}
	// IE 6/7/8
	else this.canvas.attachEvent("onmousewheel", this.zoomHandler);
	
	
	
	
}



Mandelbrot.prototype.setPixel = function(imageData, canvas, x, y, color){
	var idx = (x + (y * canvas.width)) * 4 /*rgba*/;
	imageData.data[idx] = color.r;
	imageData.data[idx+1] = color.g;
	imageData.data[idx+2] = color.b;
	imageData.data[idx+3] = color.a;
};


Mandelbrot.prototype.getPixel = function(imageData, canvas, x, y){
	var idx = (x + (y * canvas.width)) * 4 /*rgba*/;
	return {
		r: imageData.data[idx],
		g: imageData.data[idx+1],
		b: imageData.data[idx+2],
		a: imageData.data[idx+3]
	};
};

Mandelbrot.prototype.noAnimateGenerate = function(){
	this.isReady = false;
	//for(var iteractions=1; iteractions<=this.maxIteractions; iteractions++){
		var iteractions = this.maxIteractions;
		console.log("Iteraction: "+iteractions+"/"+this.maxIteractions);
		var w = this.canvas.width;
		var h = this.canvas.height;
		var w2 = Math.floor(w / 2);
		var h2 = Math.floor(h / 2);

		
		for ( var py = 0; py < h; py++)
			for ( var px = 0; px < w; px++) {
				var x0 = (((px - w2) / w) * this.zoomFactor) + this.transX;
				var y0 = (((py - h2) / h) * this.zoomFactor) + this.transY;

				var color = {};
				var res = this.belongToSet(x0, y0, iteractions);
				if( res === true){
					color = {
							r : 0,
							g : 0,
							b : 0,
							a : 255
						};
				}
				else{
					var rgb = hslToRgb(res / iteractions, 1, 0.5);
					color.r = rgb[0];
					color.g = rgb[1];
					color.b = rgb[2];
					color.a = 255;
				}

				this.setPixel(this.imageData, this.canvas, px, py, color);
			}
		
		//Draw axis
		for ( var py = 0; py < h && this.drawGrid; py++)
			for ( var px = 0; px < w; px++) {
				var x = (((px - w2) / w) * this.zoomFactor) + this.transX;
				var y = (((py - h2) / h) * this.zoomFactor) + this.transY;
				if(x == 0 || y == 0){
					this.setPixel(this.imageData, this.canvas, px, py, {r:255, g:255, b:255, a:255});
				}
				
				if(x == 0.5 || y == 0.5 || x == -0.5 || y == -0.5){
					this.setPixel(this.imageData, this.canvas, px, py, {r:0, g:255, b:255, a:255});
				}
				
				if(x == 1 || y == 1 || x == -1 || y == -1){
					this.setPixel(this.imageData, this.canvas, px, py, {r:255, g:0, b:255, a:255});
				}
			}
		
		this.context.putImageData(this.imageData, 0, 0);
	//}
	
	this.isReady = true;
	console.log("Ready");
	
};

Mandelbrot.prototype.generate = function(iteractions) {
	
	if(iteractions > this.maxIteractions){
		this.isReady = true;
		console.log("Ready");
		return;
	}
	
	this.isReady = false;
	
	console.log("Iteraction: "+iteractions+"/"+this.maxIteractions);
	var w = this.canvas.width;
	var h = this.canvas.height;
	var w2 = Math.floor(w / 2);
	var h2 = Math.floor(h / 2);

	for ( var py = 0; py < h && this.drawGrid; py++)
		for ( var px = 0; px < w; px++) {
			var x0 = (((px - w2) / w) * this.zoomFactor) + this.transX;
			var y0 = (((py - h2) / h) * this.zoomFactor) + this.transY;
			var x = 0;
			var y = 0;
			var iteration = 0;

			while ((x * x + y * y <= 4) && (iteration++ < iteractions)) {
				var xtemp = x * x - y * y + x0;
				y = 2 * x * y + y0;
				x = xtemp;
			}

			// Calcolo del colore del pixel
			var color = {};
			if (iteration >= iteractions) {
				color = {
					r : 0,
					g : 0,
					b : 0,
					a : 255
				};
			} else {
				color.r = iteration / iteractions * 255;
				color.g = 0;
				color.b = 0;
				color.a = 255;
			}

			this.setPixel(this.imageData, this.canvas, px, py, color);
		}
	
	//Draw axis
	/*
	for ( var py = 0; py < h; py++)
		for ( var px = 0; px < w; px++) {
			var x = (((px - w2) / w) * this.zoomFactor) + this.transX;
			var y = (((py - h2) / h) * this.zoomFactor) + this.transY;
			if(x == 0 || y == 0){
				this.setPixel(this.imageData, this.canvas, px, py, {r:255, g:255, b:255, a:255});
			}
			
			if(x == 0.5 || y == 0.5 || x == -0.5 || y == -0.5){
				this.setPixel(this.imageData, this.canvas, px, py, {r:0, g:255, b:255, a:255});
			}
			
			if(x == 1 || y == 1 || x == -1 || y == -1){
				this.setPixel(this.imageData, this.canvas, px, py, {r:255, g:0, b:255, a:255});
			}
		}*/
	
	this.context.putImageData(this.imageData, 0, 0);
	var that = this;
	
	setTimeout(function(){
		that.generate(iteractions+1);
	}, this.timing);
	
};


Mandelbrot.prototype.pixelToCoords = function(px, py){

	var w = this.canvas.width;
	var h = this.canvas.height;
	var w2 = Math.floor(w / 2);
	var h2 = Math.floor(h / 2);
	
	var x = (((px - w2) / w) * this.zoomFactor) + this.transX;
	var y = (((py - h2) / h) * this.zoomFactor) + this.transY;

	return [x, y];
};

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

