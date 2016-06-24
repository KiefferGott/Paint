var socket = io.connect('http://localhost:8080');
var roomIndex = true;
function askRoom() {
	var interval = setInterval(function () {
		socket.emit('askRoomList');
		if (!roomIndex) {
			clearInterval(interval);
		}
	}, 2000);
}
$(function () {
	askRoom();
	socket.on('room', function (data) {
		if (!$.isEmptyObject(data)) {
			$.each(data, function (index, value) {
				if (!$('#' + index).length) {
					$('#room').append('<div id="' + index + '" class="room">' + value.name + '</div>');
				}
			});
		}
	});
	$('body').on('click', function(e) {
		var target = e.target;
		if (target.id === 'createRoom') {
			if (!$('#prompt').length) {
				promptUtils('<div id="prompt"><label for="roomName">Nom de la salle</label><input type="text" id="roomName"><label for="password">Mot de passe</label><input type="text" id="password"><div id="submit" class="button">Confirmer</div><div id="cancel" class="button">Annuler</div></div>');
			}
		}
		else if (target.id === 'submit') {
			socket.emit('newRoom', {name: $('#roomName').val(), password: $('#password').val()});
			removePrompt();
			socket.emit('askRoomList');
		}
		else if (target.id === 'cancel') {
			removePrompt();
		}
		else if (target.className === 'room') {
			socket.emit('requestAccess', target.id);
			socket.once('passwordRequested', function (data) {
				if (data) {
					var password = prompt('Mot de passe requis :');
					if (password !== null) {
						socket.emit('passwordAnswer', password);
						socket.once('accessGranted', function (data) {
							roomIndex = false;
							$('#room').empty();
							$('#content').hide();
							$('#draw').show();
							socket.emit('roomClientIn', {room: target.id});
						});
						socket.once('accessDenied', function (data) {
							promptUtils(data);
						});
					}
				}
				else {
					roomIndex = false;
					$('#room').empty();
					$('#content').hide();
					$('#draw').show();
					socket.emit('roomClientIn', {room: target.id});
				}
			});
		}
		else if (target.id === 'leaveRoom') {
			socket.emit('roomClientOut');
			ready = false;
			imgLayer.clearRect(0, 0, imgLayer.canvas.width, imgLayer.canvas.height);
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			$('#draw').hide();
			$('#content').show();
			askRoom();
		}
	});
	socket.on('roomData', function (data) {
		if (data.image !== null) {
			var image = new Image();
			image.onload = function() {
				imgLayer.drawImage(image, 0, 0);
				imageHere = true;
				displayDeleteButton();
			};
			image.src = data.image;
		}
		if (data.data !== null) {
			var newCanvas = new Image();
			newCanvas.onload = function() {
				context.drawImage(newCanvas, 0, 0);
				ready = true;
			};
			newCanvas.src = data.data;
		}
		else {
			ready = true;
		}
	});
});