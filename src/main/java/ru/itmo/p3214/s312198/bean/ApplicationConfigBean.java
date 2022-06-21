package ru.itmo.p3214.s312198.bean;

import org.jboss.logging.Logger;
import ru.itmo.p3214.s312198.mbeans.ClickTracker;
import ru.itmo.p3214.s312198.mbeans.PointsCalculator;

import javax.annotation.PostConstruct;
import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;

/**
 * Application configuration storage.
 * Hold all limits for metrics (x, y, r)
 */
public class ApplicationConfigBean {
    private static final Logger log = Logger.getLogger(ApplicationConfigBean.class.getName());
    private ArrayList<Double> xValues = new ArrayList<>();
    private ArrayList<Integer> yValues = new ArrayList<>();
    private ArrayList<Double> rValues = new ArrayList<>();

    public ApplicationConfigBean() {
        yValues.add(-4);
        yValues.add(-3);
        yValues.add(-2);
        yValues.add(-1);
        yValues.add(0);
        yValues.add(1);
        yValues.add(2);
        yValues.add(3);
        yValues.add(4);

        rValues.add(1d);
        rValues.add(1.5d);
        rValues.add(2d);
        rValues.add(2.5d);
        rValues.add(3d);
    }

    public ArrayList<Double> getxValues() {
        return xValues;
    }

    public void setxValues(ArrayList<Double> xValues) {
        this.xValues = xValues;
    }

    public ArrayList<Integer> getyValues() {
        return yValues;
    }

    public void setyValues(ArrayList<Integer> yValues) {
        this.yValues = yValues;
    }

    public ArrayList<Double> getrValues() {
        return rValues;
    }

    public void setrValues(ArrayList<Double> rValues) {
        this.rValues = rValues;
    }

    @PostConstruct
    void initMBeans() {
        log.info("[@@@] MBeans initialization started");
        try {
            MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
            ObjectName nameClickTracker = new ObjectName("ru.itmo.p3214.s312198.mbeans:type=ClickTracker");
            ClickTracker clickTracker = new ClickTracker();
            mbs.registerMBean(clickTracker, nameClickTracker);
            ObjectName namePointsCalculator = new ObjectName("ru.itmo.p3214.s312198.mbeans:type=PointsCalculator");
            PointsCalculator pointsCalculator = new PointsCalculator();
            mbs.registerMBean(pointsCalculator, namePointsCalculator);
        } catch (MalformedObjectNameException | InstanceAlreadyExistsException | MBeanRegistrationException |
                 NotCompliantMBeanException e) {
            log.error("[@@@] MBeans initialization error: " + e.getMessage());
        }
        log.info("[@@@] MBeans initialization completed");
    }
}
