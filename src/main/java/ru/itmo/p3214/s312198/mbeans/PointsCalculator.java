package ru.itmo.p3214.s312198.mbeans;

import ru.itmo.p3214.s312198.db.PointsDB;
import ru.itmo.p3214.s312198.model.Point;

import javax.management.AttributeChangeNotification;
import javax.management.MBeanNotificationInfo;
import javax.management.Notification;
import javax.management.NotificationBroadcasterSupport;

public class PointsCalculator extends NotificationBroadcasterSupport implements PointsCalculatorMBean {
    private long sequenceNumber = 1;

    PointsDB pointsDB = new PointsDB();

    @Override
    public long getTotal() {
        return pointsDB.loadAll().size();
    }

    @Override
    public long getHit() {
        return pointsDB.loadAll().stream().filter(Point::getHit).count();
    }

    @Override
    public void checkPoints() {
        for (Point point : pointsDB.loadAll()) {
            if ((Math.abs(point.getX()) > 6) || (Math.abs(point.getY()) > 6)) {
                Notification notification = new AttributeChangeNotification(this,
                        sequenceNumber++, System.currentTimeMillis(),
                        String.format("Point is out of working area [%.1f, %.1f]", point.getX(), point.getY()),
                        null, null, null, null);
                sendNotification(notification);
            }
        }
    }

    @Override
    public MBeanNotificationInfo[] getNotificationInfo() {
        String[] types = new String[]{
                AttributeChangeNotification.ATTRIBUTE_CHANGE
        };
        String name = AttributeChangeNotification.class.getName();
        String description = "Point is out of working area";
        return new MBeanNotificationInfo[]{
                new MBeanNotificationInfo(types, name, description)
        };
    }

}
