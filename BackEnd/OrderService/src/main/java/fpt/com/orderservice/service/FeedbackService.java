package fpt.com.orderservice.service;

import fpt.com.orderservice.model.Feedback;
import fpt.com.orderservice.model.dto.FeedbackRequest;
import fpt.com.orderservice.model.dto.FeedbackResponse;

import java.util.List;

public interface FeedbackService {
    List<Feedback> findAll();
    Feedback findById(int id);
    Feedback save(FeedbackRequest feedback);
    Feedback update(Feedback feedback);
    void deleteById(int id);
    List<Feedback> findByUserId(int userId);
    List<FeedbackResponse> findByProductId(int productId);
    Feedback findByOrderDetail(int orderDetailId);
}

