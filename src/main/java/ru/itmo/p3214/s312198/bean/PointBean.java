package ru.itmo.p3214.s312198.bean;

import ru.itmo.p3214.s312198.model.Point;

import java.util.Date;

public class PointBean extends Point {

    public PointBean() {
        setX(0d);
        setY(0d);
        setR(3d);
        setHit(Boolean.FALSE);
        setDate(new Date());
    }

    public void updateX(Double x) {
        setX(x);
    }

    public void updateY(Double y) {
        setY(y);
    }

    public void updateR(Double r) {
        setR(r);
    }
}
