package fpt.com.orderservice.service;

import fpt.com.orderservice.model.Feedback;

import java.util.List;

public interface FeedbackService {
    List<Feedback> findAll();
    Feedback findById(int id);
    Feedback save(Feedback feedback);
    Feedback update(Feedback feedback);
    void deleteById(int id);
    List<Feedback> findByUserId(int userId);
    List<Feedback> findByProductId(int productId);
}

