var context;
var imgLayer;
var imageHere = false;
var ready = false;
$(function () {
	var preX;
	var preY;
	var mouseX;
	var mouseY;
	var color = '#000';
	var thickness = 5;
	var draw = false;
	var tools = 'brush';
	var busy = false;
	var deg = 0;
	var imageLayer = document.createElement('canvas');
	imageLayer.height = 800;
	imageLayer.width = 1500;
	imageLayer.id = 'imageLayer';
	var tempLayer = document.createElement('canvas');
	tempLayer.height = 800;
	tempLayer.width = 1500;
	tempLayer.id = 'layer';
	$('#canvasContainer').append(tempLayer);
	$('#canvasContainer').prepend(imageLayer);
	var layer = document.getElementById('layer').getContext("2d");
	imgLayer =document.getElementById('imageLayer').getContext("2d");
	context = document.getElementById('canvas').getContext("2d");
	function sendData() {
		socket.emit('roomClientData', context.canvas.toDataURL('image/png'));
	}
	function drawIt(x, y, exX, exY, thick, coloration, area) {
		area.strokeStyle = coloration;
		area.lineJoin = "round";
		area.lineWidth = thick;
		area.beginPath();
		area.moveTo(x, y);
		area.lineTo(exX, exY);
		area.closePath();
		area.stroke();
	}
	function drawTo(x, y){
		drawIt(x, y, preX, preY, thickness, color, context);
		socket.emit('draw', {preX: preX, preY: preY, x: x, y: y, color: color, thickness: thickness});
		preX = x;
		preY = y;
	}
	function drawLine(x, y) {
		layer.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
		drawIt(x, y, preX, preY, thickness, color, layer);
	}
	function drawCircle(x, y, exX, exY, thick, coloration, area, ang, fill) {
		area.strokeStyle = coloration;
		area.lineWidth = thick;
		area.beginPath();
		area.ellipse(exX, exY, Math.abs(exX - x), Math.abs(exY - y), ang * Math.PI/180, 0, 2 * Math.PI);
		if (fill) {
			area.fillStyle = coloration;
			area.fill();
		}
		area.stroke();
	}
	function drawCircleTo(x, y, fill) {
		layer.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
		drawCircle(x, y, preX, preY, thickness, color, layer, deg, fill);
	}
	function drawRect(x, y, exX, exY, thick, coloration, area, ang, fill) {
		area.translate(exX - (exX - x)/2, exY - (exY - y)/2);
		area.rotate(ang * Math.PI/180);
		area.strokeStyle = coloration;
		area.lineWidth = thick;
		area.beginPath();
		if (fill) {
			area.fillStyle = coloration;
			area.fillRect(-(x - exX)/2, -(y - exY)/2, x - exX, y - exY);
		}
		else {
			area.rect(-(x - exX)/2, -(y - exY)/2, x - exX, y - exY);
			area.stroke();
		}
	}
	function drawRectTo(x, y, fill) {
		layer.save();
		layer.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
		drawRect(x, y, preX, preY, thickness, color, layer, deg, fill);
		layer.restore();
	}
	function erase(area, x, y, thick) {
		area.clearRect(x, y, thick, thick);
	}
	function mergeCanvas(area) {
		if (typeof area === 'undefined') {
			context.drawImage(tempLayer, 0, 0);
			layer.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
		}
		else {
			context.drawImage(area, 0, 0);
		}
	}
	function loadFile(e) {
		if (e.target.files[0].type) {
			var reader = new FileReader();
			var output = new Image();
				output.crossOrigin = 'Anonymous';
			reader.onload = function(){
				output.onload = function () {
					imgLayer.clearRect(0, 0, imgLayer.canvas.width, imgLayer.canvas.height);
					imgLayer.drawImage(output, 0, 0, 1500, 800);
					imageHere = true;
					displayDeleteButton();
					socket.emit('image', imgLayer.canvas.toDataURL('image/png'))
				}
				output.src = reader.result;
			};
			reader.readAsDataURL(e.target.files[0]);
		}
	}
	socket.on('brushed', function (data) {
		drawIt(data.x, data.y, data.preX, data.preY, data.thickness, data.color, context);
	}).on('circled', function (data) {
		drawCircle(data.x, data.y, data.preX, data.preY, data.thickness, data.color, context, data.ang, data.fill);
	}).on('rekt', function (data) {
		var socketLayer = document.createElement('canvas');
		socketLayer.height = 800;
		socketLayer.width = 1500;
		var sockLayer = socketLayer.getContext("2d");
		sockLayer.clearRect(0, 0, sockLayer.canvas.width, sockLayer.canvas.height);
		drawRect(data.x, data.y, data.preX, data.preY, data.thickness, data.color, sockLayer, data.ang, data.fill);
		mergeCanvas(socketLayer);
		socketLayer.remove();
	}).on('erased', function (data) {
		erase(context, data.x, data.y, data.thickness);
	}).on('imageData', function (data) {
		var output = new Image();
			output.crossOrigin = 'Anonymous';
			output.onload = function () {
				imgLayer.clearRect(0, 0, imgLayer.canvas.width, imgLayer.canvas.height);
				imgLayer.drawImage(output, 0, 0, 1500, 800);
			}
			output.src = data;
	}).on('imageDeleted', function (data) {
		imgLayer.clearRect(0, 0, imgLayer.canvas.width, imgLayer.canvas.height);
		imageHere = false;
		displayDeleteButton();
	});
	$('body').click(function (e) {
		var target = e.target;
		if (target.parentNode.id === 'tools') {
			tools = target.id;
		}
		else if (e.target.id === 'deleteImage') {
			imgLayer.clearRect(0, 0, imgLayer.canvas.width, imgLayer.canvas.height);
			imageHere = false;
			displayDeleteButton();
			socket.emit('deleteImage');
		}
		else if (e.target.id === 'download') {
			download();
		}
	}).on('DOMMouseScroll', function(e){
		if (e.originalEvent.detail < 0) {
			deg += 10;
		}
		else {
			deg -= 10;
		}
		if (draw) {
			switch (tools) {
				case 'circle':
				drawCircleTo(mouseX, mouseY);
				break;
				case 'rect':
				drawRectTo(mouseX, mouseY);
				break;
				case 'filledCircle':
				drawCircleTo(mouseX, mouseY, true);
				break;
				case 'filledRect':
				drawRectTo(mouseX, mouseY, true);
				break;
			}
		}
	});
	$('#image').change(function (e) {
		loadFile(e);
	})
	$('#color').change(function () {
		color = $(this).val();
	});
	$('#thickness').change(function () {
		thickness = $(this).val();
	});
	$('canvas').mouseup(function(e){
		if (e.target.tagName === 'CANVAS' && ready) {
			if (draw) {
				mouseX = e.pageX - this.offsetLeft;
				mouseY = e.pageY - this.offsetTop;
				mergeCanvas();
				switch (tools) {
					case 'circle':
					socket.emit('circle', {preX: preX, preY: preY, x: mouseX, y: mouseY, color: color, thickness: thickness, ang: deg, fill: false});
					break;
					case 'rect':
					socket.emit('rect', {preX: preX, preY: preY, x: mouseX, y: mouseY, color: color, thickness: thickness, ang: deg, fill: false});
					break;
					case 'filledCircle':
					socket.emit('circle', {preX: preX, preY: preY, x: mouseX, y: mouseY, color: color, thickness: thickness, ang: deg, fill: true});
					break;
					case 'filledRect':
					socket.emit('rect', {preX: preX, preY: preY, x: mouseX, y: mouseY, color: color, thickness: thickness, ang: deg, fill: true});
					break;
					case 'line':
					socket.emit('draw', {preX: preX, preY: preY, x: mouseX, y: mouseY, color: color, thickness: thickness});
					break;
				}
				draw = false;
			}
		}
	}).mouseleave(function(e){
		if (e.target.tagName === 'CANVAS' && ready) {
			draw = false;
		}
	}).mousedown(function(e){
		if (e.target.tagName === 'CANVAS' && ready) {
			preX = e.pageX - this.offsetLeft;
			preY = e.pageY - this.offsetTop;
			draw = true;
			deg = 0;
		}
	}).mousemove(function(e){
		if (e.target.tagName === 'CANVAS' && ready) {
			if (draw) {
				mouseX = e.pageX - this.offsetLeft;
				mouseY = e.pageY - this.offsetTop;
				switch (tools) {
					case 'brush':
					drawTo(mouseX, mouseY);
					break;
					case 'line':
					drawLine(mouseX, mouseY);
					break;
					case 'circle':
					drawCircleTo(mouseX, mouseY);
					break;
					case 'filledCircle':
					drawCircleTo(mouseX, mouseY, true);
					break;
					case 'rect':
					drawRectTo(mouseX, mouseY);
					break;
					case 'filledRect':
					drawRectTo(mouseX, mouseY, true);
					break;
					case 'eraser':
					erase(context, mouseX, mouseY, 10);
					socket.emit('erase', {x: mouseX, y: mouseY, thickness: 10});
					break;
				}
				if (!busy && (tools === 'brush' || tools === 'eraser')) {
					busy = true;
					setTimeout(function () {
						sendData();
						busy = false;
					}, 1000);
				}
			}
		}
	});
});