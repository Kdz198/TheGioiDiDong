package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.model.Feedback;
import fpt.com.orderservice.repo.FeedbackRepo;
import fpt.com.orderservice.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepo feedbackRepo;

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
    public Feedback save(Feedback feedback) {
        return feedbackRepo.save(feedback);
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
    public List<Feedback> findByProductId(int productId) {
        return feedbackRepo.findByProductId(productId);
    }
}

