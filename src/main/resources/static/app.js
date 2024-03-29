var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var idDrawing;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (drawing) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + drawing, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);

            });
        });

    };



    return {

        init: function () {
            var can = $("#canvas")[0];
            var self = this;
            can.addEventListener("pointerdown", function (event) {
                self.publishPoint(event.offsetX, event.offsetY);
            });


        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            stompClient.send("/topic/newpoint." + idDrawing, {}, JSON.stringify(pt));
            //publicar el evento
        },

        connect: function (drawing) {
            idDrawing = drawing;
            connectAndSubscribe(drawing);
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();