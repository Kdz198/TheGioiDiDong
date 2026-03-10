package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.feignclient.UserClient;
import fpt.com.orderservice.model.Feedback;
import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.model.dto.FeedbackRequest;
import fpt.com.orderservice.model.dto.FeedbackResponse;
import fpt.com.orderservice.repo.FeedbackRepo;
import fpt.com.orderservice.repo.OrderDetailRepo;
import fpt.com.orderservice.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepo feedbackRepo;
    @Autowired
    private OrderDetailRepo orderDetailRepo;
    @Autowired
    private UserClient userClient;

    @Override
    public List<Feedback> findAll() {
        return feedbackRepo.findAll();
    }

    @Override
    public Feedback findById(int id) {
        return feedbackRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
    }

    @Override
    public Feedback save(FeedbackRequest feedback) {
        Feedback newFeedback = new Feedback();
        newFeedback.setUserId(feedback.getUserId());
        newFeedback.setProductId(feedback.getProductId());
        newFeedback.setRating(feedback.getRating());
        newFeedback.setComment(feedback.getComment());
        OrderDetail detail = orderDetailRepo.findById(feedback.getOrderDetailId());
        newFeedback.setOrderDetail(detail);
        return feedbackRepo.save(newFeedback);
    }

    @Override
    public Feedback update(Feedback feedback) {
        if (!feedbackRepo.existsById(feedback.getId())) {
            throw new RuntimeException("Feedback not found with id: " + feedback.getId());
        }
        return feedbackRepo.save(feedback);
    }

    @Override
    public void deleteById(int id) {
        feedbackRepo.deleteById(id);
    }

    @Override
    public List<Feedback> findByUserId(int userId) {
        return feedbackRepo.findByUserId(userId);
    }

    @Override
    public List<FeedbackResponse> findByProductId(int productId) {
        List<Feedback> feedbacks =  feedbackRepo.findByProductId(productId);
        List<FeedbackResponse> list = new ArrayList<>();
        for (Feedback feedback : feedbacks) {
            FeedbackResponse feedbackResponse = new FeedbackResponse();
            String name = userClient.getNameAccount(feedback.getUserId());
            feedbackResponse.setUserName(name);
            feedbackResponse.setProductId(feedback.getProductId());
            feedbackResponse.setRating(feedback.getRating());
            feedbackResponse.setComment(feedback.getComment());
            feedbackResponse.setOrderDetailId(feedback.getOrderDetail().getId());
            feedbackResponse.setDate(feedback.getDate());
            list.add(feedbackResponse);
        }
        return list;
    }

    @Override
    public Feedback findByOrderDetail(int orderDetailId) {
        return feedbackRepo.findByOrOrderDetail_Id(orderDetailId);
    }


}

