package ru.itmo.p3214.s312198.db;

import org.hibernate.Session;
import ru.itmo.p3214.s312198.model.Point;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.ArrayList;
import java.util.List;

public class PointsDB {

    private static final EntityManagerFactory emf = Persistence.createEntityManagerFactory("ru.itmo.p3214.s312198");

    public static EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public void save(Point point) {
        EntityManager em = getEntityManager();
        em.getTransaction().begin();
        em.persist(point);
        em.getTransaction().commit();
    }

    public void saveAll(List<Point> points) {
        EntityManager em = getEntityManager();
        em.getTransaction().begin();
        for (Point point : points) {
            em.persist(point);
        }
        em.getTransaction().commit();
    }

    public List<Point> loadAll() {
        List<Point> points = new ArrayList<Point>();
        EntityManager em = getEntityManager();
        points = em.createQuery("select p from Point p", Point.class).getResultList();
        return points;
    }

    public void clear() {
        EntityManager em = getEntityManager();
        em.getTransaction().begin();
        em.createQuery("delete from Point").executeUpdate();
        em.getTransaction().commit();
    }
}
