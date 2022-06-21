package ru.itmo.p3214.s312198.mbeans;

import ru.itmo.p3214.s312198.db.PointsDB;
import ru.itmo.p3214.s312198.model.Point;

import java.util.ArrayList;
import java.util.Comparator;

public class ClickTracker implements ClickTrackerMBean {

    PointsDB pointsDB = new PointsDB();

    @Override
    public long getInterval() {
        long interval = 0;
        ArrayList<Point> list = new ArrayList<>(pointsDB.loadAll());
        if (list.size() > 1) {
            list.sort(Comparator.comparing(Point::getDate).reversed());
            long fullTime = list.get(0).getDate().getTime() - list.get(list.size() - 1).getDate().getTime();
            interval = fullTime / list.size();
        }
        return interval;
    }
}
