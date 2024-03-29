var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var numdibujo;
    var canvas, ctx;

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


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + numdibujo, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);
            });
            stompClient.subscribe('/topic/newpolygon.' + numdibujo, function (eventbody) {
                var points = JSON.parse(eventbody.body);
                drawPolygon(points);
            });
        });
    };

    var drawPolygon = function (points) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.stroke();
    };

    return {

        init: function () {
            canvas = $("#canvas")[0];
            ctx = canvas.getContext("2d");
            var self = this;
            canvas.addEventListener("pointerdown", function(event) {
                self.publishPoint(event.offsetX, event.offsetY);
            });
        },

        publishPoint: function(px, py){
            var pt = new Point(px,py);
            console.info("publishing point at "+pt);
            stompClient.send("/app/newpoint." + numdibujo, {}, JSON.stringify(pt));
        },

        connect: function(idDrawing) {
            numdibujo = idDrawing;
            connectAndSubscribe();
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