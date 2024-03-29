package edu.eci.arsw.collabpaint.controllers;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class STOMPMessagesHandler {

    private final ConcurrentHashMap<Integer, CopyOnWriteArrayList<Point>> polygons = new ConcurrentHashMap<>();
    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:" + pt);
        polygons.putIfAbsent(Integer.valueOf(numdibujo), new CopyOnWriteArrayList<>());
        CopyOnWriteArrayList<Point> pointsPolygon = polygons.get(Integer.valueOf(numdibujo));
        pointsPolygon.add(pt);
        if (pointsPolygon.size() >= 3) {
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, pointsPolygon);
        } else {
            msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
        }
    }
}