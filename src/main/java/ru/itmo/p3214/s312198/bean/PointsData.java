package ru.itmo.p3214.s312198.bean;

import org.primefaces.PrimeFaces;
import ru.itmo.p3214.s312198.db.PointsDB;
import ru.itmo.p3214.s312198.model.Point;

import javax.faces.context.FacesContext;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Points data holder.
 * Contains all points in internal storage, calls DB storage methods, provides additional methods for AJAX calls.
 */
public class PointsData implements Serializable {

    private final ConcurrentHashMap<String, Point> points = new ConcurrentHashMap<>();
    private final PointsDB pointsDB = new PointsDB();

    public PointsData() {
    }

    /**
     * Clears internal points list
     */
    public void clear() {
        this.points.clear();
    }

    /**
     * AJAX method to add a point from the graph
     *
     * @return newly added point
     */
    public Point addFromGraph() {
        Double _x = Double.parseDouble(FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get("fgX"));
        Double _y = Double.parseDouble(FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get("fgY"));
        Double _r = Double.parseDouble(FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get("fgR"));
        Point point = this.add(new Point(_x, _y, _r, false, new Date()));
        PrimeFaces.current().ajax().addCallbackParam("hit", point.getHit());
        return point;
    }

    /**
     * AJAX method to check the hit status by point's coordinates
     */
    public void getHit() {
        Double _x = Double.parseDouble(FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get("fgX"));
        Double _y = Double.parseDouble(FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get("fgY"));
        Double _r = Double.parseDouble(FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get("fgR"));
        Point point = new Point(_x, _y, _r, false, new Date());
        PrimeFaces.current().ajax().addCallbackParam("hit", this.isHit(point));
    }

    /**
     * AJAX method to clear all points
     */
    public void clearData() {
        this.clearDB();
        this.points.clear();
    }

    /**
     * Adds point directly.
     * Verifies hit status inside and adds date/time if required
     *
     * @param point point to add
     * @return newly added point with hit status
     */
    public Point add(Point point) {
        if (point == null) {
            return null;
        } else {
            if (point.getDate() == null) {
                point.setDate(new Date());
            }
            Point pointToSave = new Point(point.getX(), point.getY(), point.getR(), true, new Date());
            pointToSave.setHit(this.isHit(pointToSave));

            pointsDB.save(pointToSave);
            this.points.put(UUID.randomUUID().toString(), pointToSave);
            return pointToSave;
        }
    }

    /**
     * Checks if the point hits the area
     *
     * @param point point to verify
     * @return hit status as a boolean value
     */
    private Boolean isHit(Point point) {
        return (point.getX() <= 0 && point.getY() >= 0 && (point.getX() * point.getX() + point.getY() * point.getY() <= point.getR() * point.getR())) ||
                (point.getX() <= 0 && point.getY() <= 0 && point.getX() >= -point.getR() && point.getY() >= -(point.getR() / 2) &&
                        (point.getY()) >= -((point.getX() + point.getR())) / 2) ||
                (point.getX() >= 0 && point.getY() <= 0 && point.getX() <= (point.getR() / 2) && point.getY() >= -point.getR());
    }

    /**
     * Returns a list of all points sorted by date/time reversely
     *
     * @return list of points
     */
    public List<Point> getAll() {
        ArrayList<Point> list = new ArrayList<>(this.points.values());
        list.sort(Comparator.comparing(Point::getDate).reversed());
        return list;
    }

    /**
     * Save all poinbts to DB
     */
    public void persist() {
        pointsDB.saveAll(new ArrayList<>(this.points.values()));
    }

    /**
     * Load points from DB
     */
    public void restore() {
        points.clear();
        ArrayList<String> pointsToJS = new ArrayList<>();
        for (Point point : pointsDB.loadAll()) {
            points.put(UUID.randomUUID().toString(), point);
            pointsToJS.add("{\"x\": " + String.format("%.1f", point.getX()).replace(",", ".")
                    + ", \"y\": " + String.format("%.1f", point.getY()).replace(",", ".")
                    + ", \"hit\": " + point.getHit() + "}");
        }
        PrimeFaces.current().ajax().addCallbackParam("data",
                "{ \"dots\" : " + pointsToJS.toString() + "}");
        PrimeFaces.current().ajax().addCallbackParam("loaded", points.values().size());
    }

    /**
     * Delete all points from DB
     */
    public void clearDB() {
        pointsDB.clear();
    }
}
